#!/usr/bin/env python3
"""One-off driver for the Gallery title ink bake.

Launches headless Chrome on tools/bake-title-ink.html, waits for the bake,
saves the SVG to assets/gallery-title-ink.svg and prints the CSS sizing
numbers for style.css. Stdlib only — the raw-WebSocket CDP client is the
repo's verification-harness pattern. Machine-local Chrome path, fine for a
one-time bake tool.

Usage: python3 tools/bake-title-ink.py
"""
import base64, json, os, socket, struct, subprocess, sys, time, urllib.request

CHROME = os.path.expanduser("~/Library/Caches/ms-playwright/chromium_headless_shell-1243/"
                            "chrome-headless-shell-mac-arm64/chrome-headless-shell")
PAGE = os.path.abspath(os.path.join(os.path.dirname(__file__), "bake-title-ink.html"))
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "assets", "gallery-title-ink.svg"))
PORT = 9369


class WS:
    def __init__(self, url):
        rest = url[len("ws://"):]
        hostport, path = rest.split("/", 1)
        host, port = hostport.split(":")
        self.sock = socket.create_connection((host, int(port)), timeout=20)
        self.sock.settimeout(20)
        key = base64.b64encode(os.urandom(16)).decode()
        self.sock.send((f"GET /{path} HTTP/1.1\r\nHost: {hostport}\r\nUpgrade: websocket\r\n"
                        f"Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        buf = b""
        while b"\r\n\r\n" not in buf:
            buf += self.sock.recv(4096)
        self.buf = buf.split(b"\r\n\r\n", 1)[1]
        self._frag = b""

    def _rx(self, n):
        while len(self.buf) < n:
            c = self.sock.recv(65536)
            if not c:
                raise EOFError
            self.buf += c
        out, self.buf = self.buf[:n], self.buf[n:]
        return out

    def send(self, obj):
        d = json.dumps(obj).encode()
        h = bytearray([0x81])
        n = len(d)
        if n < 126:
            h.append(0x80 | n)
        elif n < 65536:
            h.append(0x80 | 126); h += struct.pack(">H", n)
        else:
            h.append(0x80 | 127); h += struct.pack(">Q", n)
        m = os.urandom(4)
        h += m
        self.sock.send(bytes(h) + bytes(b ^ m[i % 4] for i, b in enumerate(d)))

    def recv(self):
        while True:
            b1, b2 = self._rx(2); op = b1 & 0xF; n = b2 & 0x7F
            if n == 126:
                n = struct.unpack(">H", self._rx(2))[0]
            elif n == 127:
                n = struct.unpack(">Q", self._rx(8))[0]
            if b2 & 0x80:
                m = self._rx(4); d = bytes(b ^ m[i % 4] for i, b in enumerate(self._rx(n)))
            else:
                d = self._rx(n)
            if op in (1, 2):
                self._frag += d
                msg = self._frag.decode(); self._frag = b""
                return msg
            elif op == 0:
                self._frag += d
            elif op == 9:  # ping -> pong
                h = bytearray([0x8A]); m = os.urandom(4); h.append(0x80 | len(d)); h += m
                self.sock.send(bytes(h) + bytes(b ^ m[i % 4] for i, b in enumerate(d)))


class CDP:
    def __init__(self, port, flags):
        self.proc = subprocess.Popen([CHROME, f"--remote-debugging-port={port}",
            f"--user-data-dir=/tmp/cp{port}", "--no-first-run", "--disable-gpu", "about:blank"] + flags,
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        t = None
        for _ in range(120):
            try:
                ts = [x for x in json.load(urllib.request.urlopen(
                    f"http://127.0.0.1:{port}/json/list", timeout=2)) if x.get("type") == "page"]
                if ts:
                    t = ts[0]; break
            except Exception:
                pass
            time.sleep(0.15)
        if t is None:
            raise RuntimeError("chrome did not come up")
        self.ws = WS(t["webSocketDebuggerUrl"]); self.mid = 0

    def rpc(self, method, params=None):
        self.mid += 1; mid = self.mid
        self.ws.send({"id": mid, "method": method, "params": params or {}})
        while True:
            m = json.loads(self.ws.recv())
            if m.get("id") == mid:
                return m

    def eval(self, expr, ap=False):
        r = self.rpc("Runtime.evaluate", {"expression": expr, "returnByValue": True, "awaitPromise": ap})
        if r.get("result", {}).get("exceptionDetails"):
            return ("EXC", str(r["result"]["exceptionDetails"])[:300])
        return r["result"].get("result", {}).get("value")

    def shot(self, path):
        r = self.rpc("Page.captureScreenshot", {"format": "png"})
        open(path, "wb").write(base64.b64decode(r["result"]["data"]))

    def close(self):
        try:
            self.proc.terminate()
        except Exception:
            pass


def main():
    cdp = CDP(PORT, ["--window-size=1440,900"])
    try:
        cdp.rpc("Page.navigate", {"url": "file://" + PAGE})
        deadline = time.time() + 90
        err = ready = None
        while time.time() < deadline:
            err = cdp.eval("window.__bakeError")
            if err:
                print("BAKE FAILED:", err, file=sys.stderr)
                return 1
            ready = cdp.eval("window.__bakeReady === true")
            if ready:
                break
            time.sleep(0.25)
        if not ready:
            print("BAKE TIMED OUT", file=sys.stderr)
            return 1
        bake = cdp.eval("window.__bake")
        if not bake or not bake.get("svg"):
            print("BAKE EMPTY", file=sys.stderr)
            return 1
        W, H = bake["width"], bake["height"]
        with open(OUT, "w") as f:
            f.write(bake["svg"])
        kb = os.path.getsize(OUT) / 1024
        cdp.shot("/tmp/bake-preview.png")
        print(f"baked: {bake['glyphCount']} glyph px, {bake['inkCount']} ink px, {kb:.1f} KB")
        print(f"natural: {W}x{H} CSS px (viewBox + svg width/height)")
        print("CSS sizing for style.css:")
        print(f"  width: clamp({round(W * 64 / 108)}px, {round(W * 7.5 / 108, 1)}vw, {round(W)}px);")
        print("  height: auto; max-width: 100%;")
        print(f"<img> width/height attributes: {W} {H}")
        return 0
    finally:
        cdp.close()


if __name__ == "__main__":
    sys.exit(main())
