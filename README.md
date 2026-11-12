# Required
JS Injector: https://github.com/n00bcodr/Jellyfin-JavaScript-Injector

IT WILL LAG YOUR DASHBOARD FOR FEW SEC - it has to get disks, so if u have like idk 10+ it will probably take few sec to load, idk, tested with 4 disk attached to libraries.

# Jellyfin-library-disks-widget
JS inject for your server so you can see current disk capacity directly on Dashboard, 12.4 tested should work later idk, claude coded because I don't have time to learn all that. It works and takes data directly from app, api not required.


# Jellyfin Library Disks Widget

A small dashboard widget for Jellyfin that shows **which disks hold your library folders**, how full they are, how much space is free and how big each disk is. No C# plugin, no compiling, no API key: it is a single script for the JS Injector plugin.

<img width="1603" height="302" alt="image" src="https://github.com/user-attachments/assets/ed1010b2-6d97-4976-bb40-515a54a30ae6" />


Jellyfin's built-in **Paths** card only shows Jellyfin's own folders (cache, metadata, logs). This widget shows the disks your *libraries* live on.

## Features

- One card per disk / mount point, listing every library that uses it (several folders on one disk = one card)
- Usage bar: green below 75%, orange 75-90%, red above 90%
- Free space and total size
- Marks network storage
- Responsive grid: cards re-flow when the browser window is resized
- Works in light and dark themes (colors follow the theme text color)
- Translated automatically into the language chosen in Jellyfin (or the browser): en, pl, de, fr, es, ru, it, nl (unknown language falls back to English)
- Nothing hard-coded: renamed mount points and new library folders show up automatically after a page refresh
- Uses the logged-in admin's session token, so no API key is needed

## Requirements

- Jellyfin with the `GET /System/Info/Storage` endpoint returning a `Libraries` list (tested on **Jellyfin 12.4**, installed directly on Linux, not in Docker)
- The JS Injector plugin
- You must be logged in as an **administrator** (the endpoint exposes server information)

## Install

1. Dashboard -> **JS Injector** -> add a new script.
2. Paste the contents of [`disk-widget.js`](disk-widget.js) and save.
3. Open the dashboard and hard-refresh (`Ctrl+F5`).

The widget appears at the bottom of the dashboard, full width.

## Check that your server supports it

Open the browser console (F12 -> Console) on the Jellyfin page, logged in as admin, and run:

```js
(async()=>{try{const r=await fetch(ApiClient.getUrl('System/Info/Storage'),{headers:{'Authorization':'MediaBrowser Token="'+ApiClient.accessToken()+'"'}});const t=await r.text();alert('STATUS '+r.status+'\n'+t.slice(0,1500))}catch(e){alert('ERROR '+e)}})()
```

- `STATUS 200` with `Libraries` -> the widget will work.
- `STATUS 404` -> your Jellyfin version does not have this endpoint.

If Chrome blocks pasting, type `allow pasting` first.

## Customization

All in `disk-widget.js`:

| What | Where |
| --- | --- |
| Add / change a language | the `T` object (one line per language) |
| Color thresholds (75% / 90%) | `build()`, the `color` line |
| Border and background strength | `.dw-card` (`22%` border, `7%` background) and `.dw-bar` (`18%`) |
| Card minimum width | `minmax(260px, 1fr)` in `.dw-grid` |
| Where the widget is placed | `findHost()` and the `#disk-usage-widget` CSS |
| Data cache time | `60000` ms in `load()` |

## Troubleshooting

**Widget does not appear** - hard-refresh (`Ctrl+F5`), check the console for `[disk-widget]` warnings, and run the endpoint test above. Themes or other Jellyfin versions may use different page classes; adjust the selectors in `findHost()`.

**Wrong language** - the language is read from these sources, in order. Check what your browser returns:

```js
[localStorage.getItem(ApiClient.getCurrentUserId()+'-language'), document.documentElement.lang, navigator.language]
```

After changing the language in Jellyfin, refresh the page.

**A card for `/` appears** - if a disk is not mounted when Jellyfin starts, the library path can fall back to the root filesystem. A new `/` card is a hint that a mount is missing.

**Docker** - Jellyfin only sees what is mounted into the container, so sizes refer to the mounted volumes. (Not tested.)

## Tested

Jellyfin 12.4 on Linuxb bare metal(test Docker yourself ), Vivaldi(any chromium based will work, all browsers should work I think), dark and light theme, English / Polish / German UI. Other translations were written without native-speaker review, corrections welcome.

## License

MIT, see [LICENSE](LICENSE).
