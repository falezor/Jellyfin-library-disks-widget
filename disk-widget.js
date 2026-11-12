/*!
 * Jellyfin "Library disks" dashboard widget
 * Shows the disks/mount points that hold your library folders: usage bar,
 * free space and total size. Designed for the JS Injector plugin.
 * License: MIT
 */
(function () {
  if (window.__diskWidget) return;
  window.__diskWidget = true;
  const ID = 'disk-usage-widget';

  // Add a language by adding one line here (key = two-letter language code).
  const T = {
    en: { title: 'Library disks', free: 'Free', disk: 'Disk', net: 'network' },
    pl: { title: 'Dyski bibliotek', free: 'Wolne', disk: 'Dysk', net: 'sieciowy' },
    de: { title: 'Bibliotheks-Laufwerke', free: 'Frei', disk: 'Laufwerk', net: 'Netzwerk' },
    fr: { title: 'Disques des bibliothèques', free: 'Libre', disk: 'Disque', net: 'réseau' },
    es: { title: 'Discos de bibliotecas', free: 'Libre', disk: 'Disco', net: 'red' },
    ru: { title: 'Диски библиотек', free: 'Свободно', disk: 'Диск', net: 'сетевой' },
    it: { title: 'Dischi delle librerie', free: 'Libero', disk: 'Disco', net: 'rete' },
    nl: { title: 'Bibliotheekschijven', free: 'Vrij', disk: 'Schijf', net: 'netwerk' }
  };

  // Language: Jellyfin user setting -> <html lang> -> browser language -> English.
  function getLang() {
    let l = '';
    try { l = localStorage.getItem(ApiClient.getCurrentUserId() + '-language') || ''; } catch (e) {}
    if (!l) l = document.documentElement.lang || '';
    if (!l) l = navigator.language || 'en';
    return l.toLowerCase().split(/[-_]/)[0];
  }
  const t = (k) => (T[getLang()] || T.en)[k];

  const fmt = (b) => {
    const u = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
    let i = 0;
    while (b >= 1024 && i < 4) { b /= 1024; i++; }
    return b.toFixed(i >= 3 ? 1 : 0) + ' ' + u[i];
  };

  // Colors follow the theme text color (currentColor), so it works in light and dark themes.
  // The first declaration of each pair is a fallback for browsers without color-mix().
  const st = document.createElement('style');
  st.textContent = `
    #${ID}{grid-column:1/-1;flex:1 0 100%;width:100%;box-sizing:border-box;padding:1em .5em;}
    #${ID} h3{margin:0 0 .6em;font-weight:500;}
    #${ID} .dw-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;}
    #${ID} .dw-card{background:rgba(128,128,128,.12);background:color-mix(in srgb,currentColor 7%,transparent);border:1px solid rgba(128,128,128,.35);border:1px solid color-mix(in srgb,currentColor 22%,transparent);border-radius:6px;padding:12px 14px;}
    #${ID} .dw-head{display:flex;justify-content:space-between;gap:8px;font-weight:500;}
    #${ID} .dw-sub{opacity:.65;font-size:.85em;margin:2px 0 8px;word-break:break-word;}
    #${ID} .dw-bar{height:8px;border-radius:4px;background:rgba(128,128,128,.25);background:color-mix(in srgb,currentColor 18%,transparent);overflow:hidden;}
    #${ID} .dw-fill{height:100%;border-radius:4px;}
    #${ID} .dw-nums{display:flex;justify-content:space-between;font-size:.85em;margin-top:6px;opacity:.85;}
  `;
  document.head.appendChild(st);

  let cache = null, cacheTime = 0;

  // Uses the logged-in admin's token, so no API key is needed.
  async function load() {
    if (cache && Date.now() - cacheTime < 60000) return cache;
    const r = await fetch(ApiClient.getUrl('System/Info/Storage'), {
      headers: { Authorization: 'MediaBrowser Token="' + ApiClient.accessToken() + '"' }
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    cache = await r.json();
    cacheTime = Date.now();
    return cache;
  }

  // One card per DeviceId (mount point), listing every library that uses it.
  function group(data) {
    const map = new Map();
    (data.Libraries || []).forEach((lib) => {
      (lib.Folders || []).forEach((f) => {
        const key = f.DeviceId || f.Path;
        if (!map.has(key)) {
          map.set(key, { id: key, free: f.FreeSpace, used: f.UsedSpace, type: f.StorageType, libs: new Set() });
        }
        map.get(key).libs.add(lib.Name);
      });
    });
    return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  function build(disks) {
    const box = document.createElement('div');
    box.id = ID;
    const h = document.createElement('h3');
    h.textContent = t('title');
    box.appendChild(h);
    const grid = document.createElement('div');
    grid.className = 'dw-grid';
    disks.forEach((d) => {
      const total = d.free + d.used;
      const pct = total ? (d.used / total) * 100 : 0;
      // Bar color thresholds: green < 75%, orange 75-90%, red > 90%.
      const color = pct > 90 ? '#e53935' : pct > 75 ? '#fb8c00' : '#4caf50';
      const card = document.createElement('div');
      card.className = 'dw-card';

      const head = document.createElement('div');
      head.className = 'dw-head';
      const a = document.createElement('span'); a.textContent = d.id;
      const b = document.createElement('span'); b.textContent = pct.toFixed(0) + '%';
      head.append(a, b);

      const sub = document.createElement('div');
      sub.className = 'dw-sub';
      sub.textContent = [...d.libs].join(', ') + (d.type === 'Network' ? ' • ' + t('net') : '');

      const bar = document.createElement('div'); bar.className = 'dw-bar';
      const fill = document.createElement('div'); fill.className = 'dw-fill';
      fill.style.width = pct.toFixed(1) + '%';
      fill.style.background = color;
      bar.appendChild(fill);

      const nums = document.createElement('div');
      nums.className = 'dw-nums';
      const n1 = document.createElement('span'); n1.textContent = t('free') + ': ' + fmt(d.free);
      const n2 = document.createElement('span'); n2.textContent = t('disk') + ': ' + fmt(total);
      nums.append(n1, n2);

      card.append(head, sub, bar, nums);
      grid.appendChild(card);
    });
    box.appendChild(grid);
    return box;
  }

  const onDashboard = () => /^#\/dashboard\/?(\?.*)?$/.test(location.hash);

  // Where the widget is attached. Change this (and the #disk-usage-widget CSS)
  // to move it, e.g. under a specific dashboard column.
  function findHost() {
    return document.querySelector('.page:not(.hide) .content-primary')
      || document.querySelector('.page:not(.hide)')
      || document.querySelector('.mainAnimatedPage:not(.hide)');
  }

  let busy = false;
  async function tick() {
    const existing = document.getElementById(ID);
    if (!onDashboard()) { if (existing) existing.remove(); return; }
    if (existing || busy) return;
    const host = findHost();
    if (!host) return;
    busy = true;
    try {
      const disks = group(await load());
      if (onDashboard() && !document.getElementById(ID)) host.appendChild(build(disks));
    } catch (e) {
      console.warn('[disk-widget]', e);
    }
    busy = false;
  }

  setInterval(tick, 1500);
})();
