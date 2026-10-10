# NewGameStudio website

A small website, one page: the studio hero, a dated studio timeline, and the Gallery game at the end of it. "give us money" in the nav opens a donation modal, and the "gallery" link scrolls down to the game. TypeScript React, built with Vite — the deployable artefact is a static `dist/` folder, no server needed.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The Vite entry: head metadata, `#root`, and the boot script tag. |
| `src/` | The app: `main.tsx` boots it, `App.tsx` is the page shell, `components/` one component per section, `data/site.ts` the content tables, `styles/site.css` all the styling. |
| `public/assets/` | All images, copied verbatim into the build — including `gallery-title-ink.svg`, the baked Gallery title wordmark, and the baked `moment-*.jpg` frames of the september moments section. |
| `tools/` | One-off build tools (not shipped): `bake-title-ink.py` regenerates the Gallery title wordmark; `bake-moment-frames.py` rebuilds the september moments frames from the source screenshots folder. |
| `deploy/Caddyfile` | The production Caddy site block, imported by the server's `/etc/caddy/Caddyfile`. |
| `.github/workflows/ci.yml` | CI: typecheck + build on every push. |
| `.github/workflows/deploy.yml` | Deploy: every push to `main` goes live. |
| `SITE-GUIDE.md` | The long guide: every section, how it works, how to change it. |
| `NewGameStudio.code-workspace` | Shortcut for opening the folder in VS Code. Optional. |

## Run it locally

```bash
npm install    # once
npm run dev    # dev server with hot reload; prints its URL
```

Check the production build:

```bash
npm run build    # typechecks, then bundles into dist/
npm run preview  # serves dist/ locally
```

## Deploy and server

Every push to `main` goes live (the deploy job took 23 seconds on its first successful run). Nobody needs a login on the server for that: GitHub Actions does the whole deploy.

### How a deploy works

`.github/workflows/deploy.yml`, on every push to `main`:

1. Installs, typechecks and builds the site on GitHub's machine (`npm ci`, `npm run build`).
2. Packs `dist/` (the built site) and `deploy/` (the Caddy block) and copies them to the server over SSH.
3. Unpacks them into a new folder, `releases/<date>-<time>-<commit>/`.
4. Points the `current` link at that folder in one step, so visitors never see a half-copied site.
5. Asks Caddy to check the whole server config (`caddy validate`). If it passes, Caddy reloads. If it fails, `current` goes back to the previous release and the run turns red.
6. Deletes all but the five newest releases.

The build runs on GitHub, not on the server, because the server's memory is already taken up by the Gallery game's own builds.

### Roll back or redeploy

- **Roll back:** Actions → Deploy → Run workflow, put an older commit SHA (or a tag) in `ref`, and run it.
- **Redeploy the current `main`:** the same, with `ref` left empty.

### The server

One server hosts this site, the Gallery game (production and staging) and consigliereonline.org. The site files live here:

```
/var/www/newgamestudio.consigliereonline.org/
├── current -> releases/<the live release>
└── releases/
    └── <date>-<time>-<commit>/
        ├── dist/      the built site, which Caddy serves
        └── deploy/    the Caddy block, which Caddy imports
```

- Deploys log in as the `dev` user. `dev` may run exactly two commands as root without a password: `caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile` and `systemctl reload caddy`.
- `/etc/caddy/Caddyfile` (root-owned, holds every site on the server) contains this line **exactly once**:
  ```
  import /var/www/newgamestudio.consigliereonline.org/current/deploy/Caddyfile
  ```
  If the line is there twice, every validate fails with `ambiguous site definition: newgamestudio.com`, and that blocks Gallery's deploys too. Never copy `deploy/Caddyfile` over `/etc/caddy/Caddyfile`: that would take every other site down.
- Shell access to the server is by SSH key only. Ask the server admin to add your public key. Any SSH client works (OpenSSH on Linux, macOS or Windows, or PuTTY).

### GitHub secrets

Settings → Secrets and variables → Actions on this repository:

| Secret | Value |
| --- | --- |
| `SERVER_HOST` | The server's address. |
| `SERVER_PORT` | `22` |
| `SERVER_USER` | `dev` |
| `SERVER_SSH_KEY` | The private half of a key made only for this repository. Its public half is the line ending in `newgamestudio-site-deploy` in `/home/dev/.ssh/authorized_keys` on the server. |

To replace the key: make a new one (`ssh-keygen -t ed25519 -N '' -C newgamestudio-site-deploy -f site_deploy`), put the private half in `SERVER_SSH_KEY`, swap the public line in `authorized_keys`, then delete both local files. GitHub never shows a secret again after it is saved.

The repository is public. Never commit a key, a password or the server's address.

### Domain and Cloudflare

- The domain is registered at GoDaddy. Its DNS is on Cloudflare, in the same zone as `gallery.newgamestudio.com`.
- DNS records: `newgamestudio.com` is an `A` record to the server, Proxied. `www` is a `CNAME` to `newgamestudio.com`, Proxied. There must be no other `A` record on `newgamestudio.com`: GoDaddy's default parking addresses were removed, and if one comes back, half the visitors land on a parked page.
- Cloudflare SSL mode is Full (strict): Cloudflare only talks to the server over HTTPS with a valid certificate.
- Caddy gets and renews the certificates from Let's Encrypt by itself. `www.newgamestudio.com` only redirects to `newgamestudio.com` (the last block in `deploy/Caddyfile`).
- GitHub Pages is off for this repository. Keep it off: it would publish the unbuilt source at a second address.

### Change something

| To change | Edit | Goes live |
| --- | --- | --- |
| Page content or styling | `src/`, `public/` | on push to `main` |
| Headers, caching, redirects | `deploy/Caddyfile` | on push to `main`, after Caddy validates it |
| Deploy steps, number of releases kept | `.github/workflows/deploy.yml` | from the next push |
| Server address, user or key | the GitHub secrets above | from the next deploy |
| Domain records | the Cloudflare dashboard | within a minute |

### When something breaks

- **The deploy run is red at "Upload and switch".** Open the run log. A Caddy error there (for example `ambiguous site definition`) means the config did not pass; the previous release is still live. Fix `deploy/Caddyfile` or the server's `/etc/caddy/Caddyfile`, then rerun.
- **Cloudflare error 525** (SSL handshake failed): Caddy has no certificate for the name yet. This happens after a DNS change. Check the log, then force a fresh try:
  ```bash
  journalctl -u caddy --since -60min --no-pager | grep -i newgamestudio.com | tail -8
  sudo caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile --force
  ```
  In that log, `tls-alpn-01 ... Cannot negotiate ALPN protocol` is normal behind Cloudflare and can be ignored. The certificate comes through the `http-01` challenge.
- **Cloudflare error 526**: a certificate exists but is invalid or expired. Check the same log.
- **A GoDaddy parked page shows:** an extra `A` record is back on `newgamestudio.com` in Cloudflare. Delete it.

## Common edits

**Change text.** Find the component under `src/components/` that renders it — the timeline and its entries in `Timeline.tsx`, the game card in `GallerySection.tsx`, the modals, header and footer each in their own file.

**Change colours.** Open `src/styles/site.css`. The colours are variables in the `:root` block at the top.

**Add or remove a carousel image.** Put the image in `public/assets/` and add one entry to `SLIDES` in `src/data/site.ts` (with its real `width`/`height` — the strip measures from the attributes before any pixels arrive). The strip loops through the list forever; thumbnails, captions and the preview update automatically.

**Change the Play Gallery link.** It points at https://gallery.newgamestudio.com/ in `src/components/GallerySection.tsx`.

**Change the Gallery title.** The blackletter wordmark with its ink outline is a baked SVG (`public/assets/gallery-title-ink.svg`), generated by `tools/bake-title-ink.py` — edit the text there, re-run the tool, never draw it live. See `SITE-GUIDE.md` section 5.2.

**Rebuild or reorder the september moments.** The frames are baked by `tools/bake-moment-frames.py` from the source screenshots folder (edit the `EXCLUDE` list there to drop more). Re-run the tool, then paste its printed `<img>` list over the old one in `MOMENTS` in `src/data/site.ts`. The cycle speed is `MOMENT_MS` at the top of `src/components/MomentsEntry.tsx`.

**Add the donation link.** The money modal's "donation link coming soon" sentence lives in `src/components/MoneyDialog.tsx`. When a real URL exists, replace the sentence with a link.

## Notes

- Fonts load from Google Fonts. Offline, the browser falls back to a system font.
- The layout adapts to phones (700px and below) and tablets (1000px and below). Those rules are in section 9 of `src/styles/site.css`.
- Visitors who have "reduce motion" turned on get no animations and the carousel does not drift on its own.
