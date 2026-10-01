# Battery Pill Time Display

A GNOME Shell extension that shows remaining battery time next to the percentage in the top-bar system status pill.

When your laptop is discharging, the panel shows time until empty. When it is charging, it shows time until full. The extra label stays in sync with the built-in percentage and hides itself when GNOME hides the battery indicator.

```
🔋 64% (2h 18m)
```

## Features

- Appends remaining time beside the existing battery percentage in the status pill
- Switches automatically between **time to empty** and **time to full**
- Hides when no battery is present, when GNOME hides the percentage, or when UPower has not estimated a time yet
- Cleans up labels and signal connections on disable

## Requirements

- **GNOME Shell 50**
- A machine with a battery reported by UPower (typical laptops)

This extension is written for the GNOME 45+ ESM module style (`import` / `export default class`). It will not load on GNOME 44 or earlier.

## Installation

Install it as a user extension. The folder name must match the UUID `battery-time-pill@sifaet`.

### From this repository

```bash
git clone https://github.com/Sifaet/battery-time-pill.git
mkdir -p ~/.local/share/gnome-shell/extensions
cp -r battery-time-pill ~/.local/share/gnome-shell/extensions/battery-time-pill@sifaet
```

Then log out and log back in (or restart GNOME Shell on X11 with `Alt+F2`, type `r`, then Enter), and enable the extension:

```bash
gnome-extensions enable battery-time-pill@sifaet
```

You can also enable it from **GNOME Extensions** or **GNOME Tweaks**.

### From a zip

```bash
gnome-extensions pack
gnome-extensions install battery-time-pill@sifaet.shell-extension.zip
gnome-extensions enable battery-time-pill@sifaet
```

On Wayland, a full session restart is required after install.

## Usage

There are no preferences. After the extension is enabled:

| Battery state | Panel text |
| --- | --- |
| Discharging | `(Xh Ym)` time remaining |
| Charging | `(Xh Ym)` time to full |
| Fully charged, estimating, or no battery | no extra text |

Times come from UPower (`TimeToEmpty` / `TimeToFull`). If the firmware or kernel has not produced a reliable estimate yet, GNOME reports `0` and this extension shows nothing until a value is available.

## How it works

The extension attaches a small `St.Label` to GNOME’s existing system status indicator, immediately after the percentage label. It reuses the same UPower D-Bus proxy already used by Quick Settings, and updates when that proxy emits `g-properties-changed`.

Relevant files:

| File | Role |
| --- | --- |
| `metadata.json` | UUID, name, description, and supported Shell versions |
| `extension.js` | Enable/disable lifecycle, label insertion, and time formatting |

It currently targets GNOME Shell **50** only, as declared in `metadata.json`.

## Compatibility notes

The panel battery widget is not a stable public API. This extension reads private members on the system indicator (`_percentageLabel`, `_systemItem`, power toggle proxy). Those names can change between GNOME releases. If a future Shell layout cannot be found, the extension logs an error and does nothing instead of crashing the session.

## Troubleshooting

**Nothing appears next to the percentage**

- Confirm the extension is enabled: `gnome-extensions info battery-time-pill@sifaet`
- Wait until UPower reports a non-zero time estimate
- Check whether GNOME itself is showing the battery percentage in the pill

**The extension does not load**

- Confirm the install directory name is exactly `battery-time-pill@sifaet`
- Confirm you are running GNOME Shell 50: `gnome-shell --version`
- Look for errors: `journalctl /usr/bin/gnome-shell -f`

## License

This project does not include a license file yet. If you intend to use or distribute it, ask the author to add one.

## Author

[Abu Sifaet Chowdhury](https://github.com/Sifaet)
