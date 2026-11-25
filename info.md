# Custom Media Player Card

A configurable Home Assistant Lovelace media player card.

## Features

- Horizontal, vertical, and compact layouts
- Album artwork with configurable dimensions and corner radius
- Optional title, artist, album, and playback state
- Independently configurable transport controls
- Optional progress bar, timestamps, volume, mute, shuffle, repeat, and source selection
- Native Home Assistant visual configuration editor
- Theme-aware defaults with configurable CSS accent and background colors

## Installation

Install through HACS once the repository is added as a custom repository under **Dashboard**.

After installation, add the **Custom Media Player Card** from the Lovelace card picker and select a `media_player` entity.

## Example

```yaml
type: custom:custom-media-card
entity: media_player.living_room
layout: horizontal
show_artwork: true
show_title: true
show_artist: true
show_album: false
show_controls: true
show_progress: true
show_volume: false
```

All supported options can also be configured through the visual editor.
