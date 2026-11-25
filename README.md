# Custom Media Player Card

A customizable Home Assistant Lovelace media player card with album artwork, independently configurable controls, and a built-in visual editor.

## Features

- Horizontal, vertical, and compact layouts
- Album artwork beside track details, with configurable size and corner radius
- Optional track title, artist, album, and playback state
- Master playback-controls toggle plus individual previous, play/pause, next, stop, shuffle, and repeat toggles
- Optional seek bar, elapsed time, and duration
- Optional volume slider, mute button, and source selector
- Configurable accent and background CSS colors
- Home Assistant visual editor and card-picker support

## Installation

1. Open **HACS** in Home Assistant.
2. Open the three-dot menu and select **Custom repositories**.
3. Add `anazario93/ha-custom-media-card` and choose **Dashboard** as the category.
4. Install **Custom Media Player Card**.
5. Add the card from the dashboard card picker and select a `media_player` entity.

If the card does not appear immediately, refresh the browser after installation.

## Configuration

The visual editor exposes the entity, layout, artwork sizing, colors, and visibility switches for each element.

A YAML example:

```yaml
type: custom:custom-media-card
entity: media_player.living_room
layout: horizontal
show_artwork: true
show_title: true
show_artist: true
show_album: false
show_controls: true
show_previous: true
show_play_pause: true
show_next: true
show_progress: true
show_volume: false
```

## Options

| Option | Default | Description |
|---|---:|---|
| `entity` | — | Required media player entity |
| `layout` | `horizontal` | `horizontal`, `vertical`, or `compact` |
| `artwork_size` | `88` | Artwork size in pixels |
| `artwork_radius` | `10` | Artwork corner radius in pixels |
| `show_artwork` | `true` | Display album artwork |
| `show_title` | `true` | Display media title |
| `show_artist` | `true` | Display artist |
| `show_album` | `false` | Display album name |
| `show_state` | `true` | Display player state |
| `show_controls` | `true` | Show or hide the playback-control row |
| `show_previous` / `show_play_pause` / `show_next` | `true` | Individual transport controls |
| `show_stop` | `false` | Display stop control |
| `show_progress` | `true` | Display seek bar and time labels |
| `show_elapsed` / `show_duration` | `true` | Individual progress time labels |
| `show_volume` / `show_mute` | `false` | Display volume controls |
| `show_shuffle` / `show_repeat` | `false` | Display shuffle and repeat controls |
| `show_source` | `false` | Display source selector when available |
| `accent_color` | `var(--primary-color)` | CSS color for accent elements |
| `card_background` | Theme background | CSS background value for the card |

Some controls depend on the selected media player integration supporting the corresponding Home Assistant media-player service or entity attributes.

## Development

The card is a standalone frontend JavaScript module and does not require a backend integration.
