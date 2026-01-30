# Number Headings Plugin for Obsidian

Automatically add outline-style numbering to headings in your Obsidian documents (e.g., `1.1.2`). Supports multiple numbering styles, per-document configuration via front matter, and automatic table of contents generation.

## Features

- **Outline-style numbering** - Add hierarchical numbers like `1.1`, `1.2.1`, `2.3.4` to your headings
- **Multiple numbering styles** - Arabic numerals (`1, 2, 3`), alphabetic (`A, B, C`), or Roman numerals (`I, II, III`)
- **Per-document settings** - Configure each document individually using front matter
- **Automatic numbering** - Optionally auto-update numbering when you save
- **Table of contents** - Generate a table of contents from your numbered headings
- **Flexible configuration** - Control first/max heading levels, separators, starting numbers, and more
- **Skip specific headings** - Exclude certain headings from numbering

## Installation

### From Obsidian Community Plugins (Recommended)

1. Open **Settings** → **Community Plugins** → **Browse**
2. Search for "Number Headings"
3. Click **Install**, then **Enable**

### Manual Installation

1. Download the latest release from the [releases page](https://github.com/onlyafly/number-headings-obsidian/releases/latest)
2. Extract the files into your vault's `.obsidian/plugins/number-headings-obsidian/` folder
3. Reload Obsidian and enable the plugin in **Settings** → **Community Plugins**

## Usage

### Commands

Open the command palette (`Cmd/Ctrl + P`) and search for these commands:

| Command | Description |
|---------|-------------|
| **Number all headings in document** | Apply numbering to all headings |
| **Number all headings in document (and show options)** | Apply numbering and open the settings dialog |
| **Remove numbering from all headings in document** | Strip all heading numbers |
| **Save settings to front matter** | Save current settings to the document's front matter |

You can assign hotkeys to these commands in **Settings** → **Hotkeys**.

### Front Matter Configuration

Configure numbering on a per-document basis using the `number headings` front matter key. This is a comma-separated list of options.

#### Basic Example

```yaml
---
number headings: first-level 2, max 4, 1.1
---
```

This will:
- Start numbering at heading level 2
- Stop at heading level 4
- Use Arabic numerals (1, 2, 3...)

#### Full Syntax

```yaml
---
number headings: auto, first-level 1, max 6, 1.1, start-at 5, contents ^toc, skip ^skip
---
```

#### Available Options

| Option | Description | Example |
|--------|-------------|---------|
| `auto` | Automatically update numbering on save | `auto` |
| `off` | Disable automatic numbering for this file | `off` |
| `first-level N` | Start numbering at heading level N (1-6) | `first-level 2` |
| `max N` | Stop numbering at heading level N (1-6) | `max 4` |
| `start-at N` | Start numbering from N instead of 1 | `start-at 5` |
| `contents ^blockid` | Generate table of contents at the specified block | `contents ^toc` |
| `skip ^blockid` | Skip numbering for heading with this block ID | `skip ^intro` |

#### Numbering Style Format

The numbering style is specified as `X.Y` where:
- `X` = style for level 1 headings
- `Y` = style for other levels

| Style | Description | Example Output |
|-------|-------------|----------------|
| `1` | Arabic numerals | 1, 2, 3, 4... |
| `A` | Alphabetic | A, B, C, D... |
| `I` | Roman numerals | I, II, III, IV... |

**Examples:**
- `1.1` → `1`, `1.1`, `1.1.1`
- `A.1` → `A`, `A.1`, `A.1.1`
- `I.1` → `I`, `I.1`, `I.1.1`
- `1.A` → `1`, `1.A`, `1.A.A`

#### Skip Top Level

To skip the first heading level, prefix with `_.`:
- `_.1.1` → Skips H1, numbers from H2 onwards

#### Separators

Add a separator between the number and heading text by appending it to the style:

| Separator | Example | Result |
|-----------|---------|--------|
| `:` | `1.1:` | `1.1: Heading` |
| `.` | `1.1.` | `1.1. Heading` |
| `-` | `1.1-` | `1.1- Heading` |
| `—` | `1.1—` | `1.1— Heading` (em-dash) |
| `)` | `1.1)` | `1.1) Heading` |

Add a space before the separator for spacing: `1.1 :` → `1.1 : Heading`

### Table of Contents

To generate a table of contents:

1. Add a block ID to a heading where you want the TOC: `## Contents ^toc`
2. Add `contents ^toc` to your front matter
3. Run the numbering command

The TOC will be inserted below that heading.

### Skipping Headings

To exclude a specific heading from numbering:

1. Add a block ID to the heading: `## Introduction ^skip`
2. Add `skip ^skip` to your front matter

## Global Settings

Access the plugin settings in **Settings** → **Number Headings** to configure:

- Default numbering style
- First and maximum heading levels
- Separator character
- Automatic numbering behavior

These settings apply to documents without front matter configuration.

## Compatibility

- **Minimum Obsidian version:** 1.4.0
- **Platforms:** Desktop and Mobile

## Version History

### Recent Releases

- **1.16.0** - Added `skip` front matter setting for skipping specific headings
- **1.15.0** - Added `off` option to disable automatic numbering per file
- **1.14.0** - Fixed per-document settings insertion
- **1.13.0** - Added right parenthesis `)` as a separator option
- **1.12.0** - Added Roman numeral support
- **1.11.0** - Added `start-at` setting; fixed TOC freeze bug
- **1.10.0** - Split numbering command into two variants (with/without dialog)

For the complete changelog, see the [releases page](https://github.com/onlyafly/number-headings-obsidian/releases).

## Contributing

Contributions are welcome! See [DEVELOPING.md](DEVELOPING.md) for setup instructions.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Credits

Inspired by [obsidian-plugin-toc](https://github.com/hipstersmoothie/obsidian-plugin-toc) by hipstersmoothie.

## License

[MIT License](LICENSE) - Copyright (c) 2021 Kevin Albrecht
