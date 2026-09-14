/* ===================================================================
   NewGameStudio background effect

   Draws a flat sheet of triangles that folds where the mouse moves and
   flattens again about three seconds later. Purely decorative.

   It is switched off automatically on touch devices, when the visitor
   prefers reduced motion, and while the tab is hidden. You can remove it
   completely by deleting the <canvas> and this script tag in index.html.

   Knobs: "lifetime" (how long a fold lasts, in ms) and "cell" (triangle size).
   =================================================================== */
(() => {
  const canvas = document.querySelector('.origami-surface');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const enabled = () => !motion.matches && pointer.matches && !document.hidden;
  let width = 0, height = 0, vertices = [], faces = [], ripples = [], frame = 0;
  let lastX = null, lastY = null, lastStamp = -Infinity;
  const lifetime = 3000;
  function clear() {
    cancelAnimationFrame(frame); frame = 0; ripples = [];
    lastX = lastY = null; lastStamp = -Infinity;
    ctx.clearRect(0, 0, width, height);
  }
  function resize() {
    clear();
    width = window.innerWidth; height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    vertices = []; faces = [];
    const cell = 86, rowHeight = cell * Math.sqrt(3) / 2;
    const columns = Math.ceil(width / cell) + 4;
    const rows = Math.ceil(height / rowHeight) + 4;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Stable, slightly irregular triangles form one continuous sheet.
        const seed = Math.sin(row * 71.3 + col * 39.7);
        const x = (col - 1) * cell + (row % 2) * cell / 2 + seed * 11;
        const y = (row - 1) * rowHeight + Math.cos(row * 31.1 + col * 53.2) * 10;
        vertices.push({ x, y, z: 0, px: x, py: y });
      }
    }
    for (let row = 0; row < rows - 1; row++) {
      for (let col = 0; col < columns - 1; col++) {
        const a = row * columns + col, b = a + 1, c = a + columns, d = c + 1;
        if (row % 2) faces.push([a,b,d], [a,d,c]);
        else faces.push([a,b,c], [b,d,c]);
      }
    }
  }
  function draw(now) {
    frame = 0;
    if (!enabled()) { clear(); return; }
    ripples = ripples.filter(r => now - r.born < lifetime);
    ctx.clearRect(0, 0, width, height);
    if (!ripples.length) return;
    for (const v of vertices) {
      let z = 0;
      for (const r of ripples) {
        const age = (now - r.born) / 1000;
        const distance = Math.hypot(v.x - r.x, v.y - r.y);
        if (distance > 560) continue;
        const spread = 125 + age * 62;
        const envelope = Math.exp(-(distance * distance) / (2 * spread * spread));
        const fade = Math.exp(-age * 2.5) * Math.pow(1 - age / 3, 2);
        // A raised fold and a travelling trough, both returning to zero.
        z += Math.cos(distance / 70 - age * 5.8) * envelope * fade * r.strength;
      }
      v.z = 78 * Math.tanh(z / 78);
      v.px = v.x + v.z * 0.13;
      v.py = v.y - v.z * 0.32;
    }
    for (const face of faces) {
      const a = vertices[face[0]], b = vertices[face[1]], c = vertices[face[2]];
      const ux = b.x-a.x, uy = b.y-a.y, uz = b.z-a.z;
      const vx = c.x-a.x, vy = c.y-a.y, vz = c.z-a.z;
      const nz = ux*vy-uy*vx;
      const nx = (uy*vz-uz*vy)/nz, ny = (uz*vx-ux*vz)/nz;
      const slope = Math.hypot(nx, ny);
      const elevation = (a.z+b.z+c.z)/3;
      const presence = Math.min(1, slope * 3.5 + Math.abs(elevation) / 50);
      if (presence < 0.004) continue;
      const light = Math.max(-0.3, Math.min(0.7, -nx * 0.65 - ny * 0.85 + elevation / 210));
      const r = Math.round(11 + light * 30), g = Math.round(20 + light * 75), bl = Math.round(34 + light * 78);
      ctx.beginPath();ctx.moveTo(a.px,a.py);ctx.lineTo(b.px,b.py);ctx.lineTo(c.px,c.py);ctx.closePath();
      ctx.fillStyle = `rgba(${Math.max(3,r)},${Math.max(6,g)},${Math.max(12,bl)},${presence})`;
      ctx.fill();
      // Creases are visible only while the sheet is bent.
      ctx.strokeStyle = `rgba(102,232,222,${Math.min(0.15, slope * 0.15) * presence})`;
      ctx.lineWidth = 0.65;ctx.stroke();
    }
    frame = requestAnimationFrame(draw);
  }
  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !enabled()) return;
    const now = performance.now(), x = event.clientX, y = event.clientY;
    const distance = lastX === null ? 20 : Math.hypot(x-lastX, y-lastY);
    if (distance < 5 || now-lastStamp < 40) return;
    ripples.push({x,y,born:now,strength:Math.min(25, 13 + distance * 0.12)});
    if (ripples.length > 32) ripples.shift();
    lastX=x;lastY=y;lastStamp=now;
    if (!frame) frame=requestAnimationFrame(draw);
  }, {passive:true});
  document.documentElement.addEventListener('pointerleave', () => { lastX=lastY=null; });
  window.addEventListener('blur', clear);
  window.addEventListener('resize', resize, {passive:true});
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  motion.addEventListener('change', clear);
  pointer.addEventListener('change', clear);
  resize();
})();
