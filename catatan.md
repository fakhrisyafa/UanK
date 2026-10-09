# Catatan Pengembangan UANK

## TAHAP 1-2 - DEPLOY PERMANEN

### Tanggal Selesai
- Deploy permanen HTTPS: 9 Oktober 2026

### Deploy URL (Ganti Localhost/Localtunnel)
- **GitHub Pages (permanen):** `https://fakhrisyafa.github.io/UanK/`
- Localtunnel: `https://uank-app.loca.lt` (sudah down)

### Fix Yang Dilakukan
1. **Path GitHub Pages Subdomain:**
   - `sw.js` cache paths: `/index.html` → `/UanK/index.html`
   - SW registration: `/sw.js` → `/UanK/sw.js`
   - Manifest `start_url`: `/` → `/UanK/`
   - Icon & asset paths: `/icons/...` → `/UanK/icons/...`

2. **File Tambahan:**
   - `.nojekyll` - bypass Jekyll build GitHub Pages
   - `vercel.json` - fallback deployment config
   - `manifest.json` - SVG icons, `type:image/svg+xml`, `mobile-web-app-capable`

3. **Offline PWA:**
   - Service Worker cache-first strategy
   - Caching 14+ assets (HTML, CSS, JS, icons, Chart.js CDN)
   - Offline detection & fallback working

### Testing
- [x] Deploy via GitHub Pages branch `main` / `(root)`
- [x] URL `https://fakhrisyafa.github.io/UanK/` reachable
- [x] PWA Add to Home Screen (Safari iOS)
- [x] Offline mode via Service Worker cache

### Catatan
- Kunjungan pertama PWA **harus online** agar SW cache aset lengkap.
- Setelah install, app bisa jalan **tanpa internet**.
- Tombol FAB/tab fix via CSS `pointer-events` (commit `1398338`).

### Branch State
- `main` latest: commit `7e4e22e`
- `tahap2-rupiah-format` merged to `main`

### File Terkait
- `index.html` - app shell + SW register
- `sw.js` - service worker dengan cache-first
- `manifest.json` - PWA manifest (SVG icons)
- `vercel.json` - static deploy config
- `catatan.md` - dokumen ini
