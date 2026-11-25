import { LitElement, html, css } from "https://esm.sh/lit@3.3.1?bundle";

const CARD_VERSION = "1.0.0";

const DEFAULTS = {
  entity: "",
  name: "",
  layout: "horizontal",
  artwork_size: 88,
  artwork_position: "left",
  show_artwork: true,
  show_title: true,
  show_artist: true,
  show_album: false,
  show_controls: true,
  show_previous: true,
  show_play_pause: true,
  show_next: true,
  show_stop: false,
  show_progress: true,
  show_elapsed: true,
  show_duration: true,
  show_volume: false,
  show_mute: false,
  show_shuffle: false,
  show_repeat: false,
  show_source: false,
  show_state: true,
  artwork_radius: 10,
  card_background: "var(--ha-card-background, var(--card-background-color, white))",
  accent_color: "var(--primary-color)",
};

const TOGGLES = [
  ["show_artwork", "Album artwork"],
  ["show_title", "Track title"],
  ["show_artist", "Artist"],
  ["show_album", "Album name"],
  ["show_state", "Playback state"],
  ["show_controls", "Playback controls"],
  ["show_previous", "Previous track"],
  ["show_play_pause", "Play / pause"],
  ["show_next", "Next track"],
  ["show_stop", "Stop"],
  ["show_progress", "Progress bar"],
  ["show_elapsed", "Elapsed time"],
  ["show_duration", "Total duration"],
  ["show_volume", "Volume slider"],
  ["show_mute", "Mute button"],
  ["show_shuffle", "Shuffle"],
  ["show_repeat", "Repeat"],
  ["show_source", "Source selector"],
];

class CustomMediaCard extends LitElement {
  static properties = {
    hass: {},
    _config: { state: true },
  };

  static styles = css`
    :host { display: block; }
    ha-card {
      box-sizing: border-box;
      overflow: hidden;
      padding: 16px;
      background: var(--cmc-background, var(--ha-card-background, var(--card-background-color)));
      color: var(--primary-text-color);
    }
    .main { display: flex; align-items: center; gap: 14px; min-width: 0; }
    .main.vertical { flex-direction: column; align-items: stretch; }
    .main.vertical .art { align-self: center; }
    .main.compact { gap: 10px; }
    .art {
      flex: 0 0 auto;
      width: var(--cmc-art-size, 88px);
      height: var(--cmc-art-size, 88px);
      object-fit: cover;
      border-radius: var(--cmc-art-radius, 10px);
      background: var(--secondary-background-color);
    }
    .details { flex: 1; min-width: 0; }
    .name { font-size: 16px; font-weight: 600; line-height: 1.3; overflow-wrap: anywhere; }
    .scroll-text { overflow-x: auto; overflow-y: hidden; white-space: nowrap; text-overflow: clip; scrollbar-width: none; -webkit-overflow-scrolling: touch; touch-action: pan-x; }
    .scroll-text::-webkit-scrollbar { display: none; }
    .artist, .album, .state { color: var(--secondary-text-color); font-size: 13px; margin-top: 3px; overflow-wrap: anywhere; }
    .state { text-transform: capitalize; }
    .placeholder { display:flex; align-items:center; justify-content:center; color:var(--secondary-text-color); }
    .progress { margin-top: 15px; }
    .time-row { display:flex; justify-content:space-between; gap:8px; color:var(--secondary-text-color); font-size:11px; margin-bottom:5px; }
    input[type="range"] { width:100%; accent-color:var(--cmc-accent, var(--primary-color)); margin:0; cursor:pointer; }
    .controls { display:flex; align-items:center; justify-content:center; gap:10px; margin-top:12px; flex-wrap:wrap; }
    .controls button, .utility button {
      border:0; background:transparent; color:var(--primary-text-color);
      width:40px; height:40px; border-radius:50%; cursor:pointer;
      display:inline-flex; align-items:center; justify-content:center;
    }
    .controls button:hover, .utility button:hover { background:var(--cmc-hover, var(--secondary-background-color)); }
    .controls button.primary { background:var(--cmc-accent, var(--primary-color)); color:var(--text-primary-color, white); width:46px; height:46px; }
    button[disabled] { opacity:.35; cursor:default; }
    ha-icon { --mdc-icon-size:22px; }
    .utility { display:flex; align-items:center; gap:8px; margin-top:10px; }
    .utility input { flex:1; min-width:70px; }
    .source { flex:1; min-width:0; max-width:100%; padding:7px; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); color:var(--primary-text-color); }
    .empty { color:var(--secondary-text-color); text-align:center; padding:18px 8px; }
    .compact .name { font-size:14px; }
    .compact .art { width:var(--cmc-art-size, 64px); height:var(--cmc-art-size, 64px); }
  `;

  setConfig(config) {
    this._config = { ...DEFAULTS, ...(config || {}) };
  }

  getCardSize() { return this._config?.show_progress ? 3 : 2; }

  get _player() { return this.hass?.states?.[this._config?.entity]; }
  get _attrs() { return this._player?.attributes || {}; }
  get _duration() { return Number(this._attrs.media_duration) || 0; }
  get _position() {
    const base = Number(this._attrs.media_position) || 0;
    if (this._player?.state !== "playing" || !this._attrs.media_position_updated_at) return base;
    const elapsed = (Date.now() - new Date(this._attrs.media_position_updated_at).getTime()) / 1000;
    return Math.min(this._duration || Infinity, Math.max(0, base + elapsed));
  }

  _formatTime(value) {
    const seconds = Math.max(0, Math.floor(Number(value) || 0));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}`;
  }

  _call(service, data = {}) {
    if (!this.hass || !this._config?.entity) return;
    this.hass.callService("media_player", service, { entity_id: this._config.entity, ...data });
  }

  _artUrl() {
    const picture = this._attrs.entity_picture;
    if (!picture) return "";
    return this.hass?.hassUrl ? this.hass.hassUrl(picture) : picture;
  }

  _seek(event) {
    const position = Number(event.target.value);
    this._call("media_seek", { seek_position: position });
  }

  _volume(event) {
    this._call("volume_set", { volume_level: Number(event.target.value) / 100 });
  }

  _source(event) {
    this._call("select_source", { source: event.target.value });
  }

  _repeat() {
    const modes = ["off", "all", "one"];
    const current = this._attrs.repeat || "off";
    this._call("repeat_set", { repeat: modes[(modes.indexOf(current) + 1) % modes.length] });
  }

  _toggleShuffle() { this._call("shuffle_set", { shuffle: !this._attrs.shuffle }); }

  render() {
    if (!this._config || !this.hass) return html``;
    const p = this._player;
    if (!this._config.entity) return html`<ha-card><div class="empty">Select a media player in the card editor.</div></ha-card>`;
    if (!p) return html`<ha-card><div class="empty">Entity not found: ${this._config.entity}</div></ha-card>`;
    const a = this._attrs;
    const playing = p.state === "playing";
    const picture = this._artUrl();
    const layout = this._config.layout === "vertical" ? "vertical" : this._config.layout === "compact" ? "compact" : "";
    const artSize = this._config.layout === "compact" ? Math.min(Number(this._config.artwork_size) || 64, 80) : Number(this._config.artwork_size) || 88;
    const sources = Array.isArray(a.source_list) ? a.source_list : [];
    const repeat = a.repeat || "off";
    const canControl = p.state !== "unavailable";
    return html`
      <ha-card style="--cmc-art-size:${artSize}px;--cmc-art-radius:${this._config.artwork_radius}px;--cmc-background:${this._config.card_background};--cmc-accent:${this._config.accent_color}">
        <div class="main ${layout}">
          ${this._config.show_artwork ? (picture
            ? html`<img class="art" src="${picture}" alt="Album artwork">`
            : html`<div class="art placeholder"><ha-icon icon="mdi:music"></ha-icon></div>`) : ""}
          <div class="details">
            ${this._config.name ? html`<div class="name">${this._config.name}</div>` : ""}
            ${this._config.show_title && a.media_title ? html`<div class="name scroll-text" title="${a.media_title}">${a.media_title}</div>` : ""}
            ${this._config.show_artist && a.media_artist ? html`<div class="artist scroll-text" title="${a.media_artist}">${a.media_artist}</div>` : ""}
            ${this._config.show_album && a.media_album_name ? html`<div class="album">${a.media_album_name}</div>` : ""}
            ${this._config.show_state ? html`<div class="state">${p.state}</div>` : ""}
          </div>
        </div>
        ${this._config.show_progress && this._duration > 0 ? html`
          <div class="progress">
            <div class="time-row">
              <span>${this._config.show_elapsed ? this._formatTime(this._position) : ""}</span>
              <span>${this._config.show_duration ? this._formatTime(this._duration) : ""}</span>
            </div>
            <input aria-label="Playback position" type="range" min="0" max="${this._duration}" step="1" .value="${String(Math.min(this._position, this._duration))}" @change="${this._seek}">
          </div>` : ""}
        ${this._config.show_controls ? html`
          <div class="controls">
            ${this._config.show_shuffle ? html`<button aria-label="Shuffle" @click="${this._toggleShuffle}" title="Shuffle"><ha-icon icon="mdi:shuffle" style="color:${a.shuffle ? "var(--cmc-accent)" : "inherit"}"></ha-icon></button>` : ""}
            ${this._config.show_previous ? html`<button aria-label="Previous track" ?disabled="${!canControl}" @click="${() => this._call("media_previous_track")}"><ha-icon icon="mdi:skip-previous"></ha-icon></button>` : ""}
            ${this._config.show_play_pause ? html`<button class="primary" aria-label="${playing ? "Pause" : "Play"}" ?disabled="${!canControl}" @click="${() => this._call(playing ? "media_pause" : "media_play")}"><ha-icon icon="${playing ? "mdi:pause" : "mdi:play"}"></ha-icon></button>` : ""}
            ${this._config.show_next ? html`<button aria-label="Next track" ?disabled="${!canControl}" @click="${() => this._call("media_next_track")}"><ha-icon icon="mdi:skip-next"></ha-icon></button>` : ""}
            ${this._config.show_stop ? html`<button aria-label="Stop" @click="${() => this._call("media_stop")}"><ha-icon icon="mdi:stop"></ha-icon></button>` : ""}
            ${this._config.show_repeat ? html`<button aria-label="Repeat: ${repeat}" title="Repeat: ${repeat}" @click="${this._repeat}"><ha-icon icon="${repeat === "one" ? "mdi:repeat-once" : "mdi:repeat"}" style="color:${repeat !== "off" ? "var(--cmc-accent)" : "inherit"}"></ha-icon></button>` : ""}
          </div>` : ""}
        ${this._config.show_volume || this._config.show_mute || this._config.show_source ? html`
          <div class="utility">
            ${this._config.show_mute ? html`<button aria-label="Mute" title="Mute" @click="${() => this._call("volume_mute", { is_volume_muted: !a.is_volume_muted })}"><ha-icon icon="${a.is_volume_muted ? "mdi:volume-off" : "mdi:volume-high"}"></ha-icon></button>` : ""}
            ${this._config.show_volume ? html`<ha-icon icon="mdi:volume-medium"></ha-icon><input aria-label="Volume" type="range" min="0" max="100" step="1" .value="${String(Math.round((Number(a.volume_level) || 0) * 100))}" @change="${this._volume}">` : ""}
            ${this._config.show_source && sources.length ? html`<select class="source" aria-label="Source" .value="${a.source || ""}" @change="${this._source}"><option value="" disabled>Source</option>${sources.map(source => html`<option value="${source}">${source}</option>`)}</select>` : ""}
          </div>` : ""}
      </ha-card>
    `;
  }

  static getConfigElement() { return document.createElement("custom-media-card-editor"); }
  static getStubConfig() { return { entity: "", ...DEFAULTS }; }
}

class CustomMediaCardEditor extends LitElement {
  static properties = { hass: {}, _config: { state: true } };
  static styles = css`
    :host { display:block; }
    .section { margin: 12px 0 18px; }
    .heading { font-weight:600; margin:0 0 8px; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:8px 14px; }
    .field { display:flex; flex-direction:column; gap:5px; min-width:0; }
    label { font-size:13px; color:var(--primary-text-color); }
    input[type="text"], input[type="number"], select {
      box-sizing:border-box; width:100%; min-height:40px; padding:8px;
      color:var(--primary-text-color); background:var(--card-background-color);
      border:1px solid var(--outline-color, var(--divider-color)); border-radius:6px;
    }
    .toggles { display:grid; grid-template-columns:1fr 1fr; gap:8px 12px; }
    .toggle { display:flex; align-items:center; gap:8px; min-height:32px; }
    .toggle input { accent-color:var(--primary-color); }
    @media(max-width:480px) { .grid,.toggles { grid-template-columns:1fr; } }
  `;

  setConfig(config) { this._config = { ...DEFAULTS, ...config }; }

  _update(key, value) {
    this._config = { ...this._config, [key]: value };
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  _entityChanged(event) {
    const value = event.detail?.value ?? event.target.value;
    this._update("entity", value);
  }

  render() {
    if (!this._config) return html``;
    return html`
      <div class="section">
        <div class="heading">Entity</div>
        <ha-entity-picker .hass="${this.hass}" .value="${this._config.entity}" .includeDomains="${["media_player"]}" @value-changed="${this._entityChanged}"></ha-entity-picker>
      </div>
      <div class="section">
        <div class="heading">Layout & appearance</div>
        <div class="grid">
          <div class="field"><label>Layout</label><select .value="${this._config.layout}" @change="${e => this._update("layout", e.target.value)}">
            <option value="horizontal">Horizontal</option><option value="vertical">Vertical</option><option value="compact">Compact</option>
          </select></div>
          <div class="field"><label>Card title (optional)</label><input type="text" .value="${this._config.name}" @input="${e => this._update("name", e.target.value)}"></div>
          <div class="field"><label>Artwork size (px)</label><input type="number" min="32" max="240" .value="${this._config.artwork_size}" @change="${e => this._update("artwork_size", Number(e.target.value))}"></div>
          <div class="field"><label>Artwork corner radius (px)</label><input type="number" min="0" max="48" .value="${this._config.artwork_radius}" @change="${e => this._update("artwork_radius", Number(e.target.value))}"></div>
          <div class="field"><label>Accent color (CSS)</label><input type="text" .value="${this._config.accent_color}" @change="${e => this._update("accent_color", e.target.value)}"></div>
          <div class="field"><label>Background (CSS)</label><input type="text" .value="${this._config.card_background}" @change="${e => this._update("card_background", e.target.value)}"></div>
        </div>
      </div>
      <div class="section">
        <div class="heading">Visible elements</div>
        <div class="toggles">
          ${TOGGLES.map(([key, label]) => html`<label class="toggle"><input type="checkbox" .checked="${Boolean(this._config[key])}" @change="${e => this._update(key, e.target.checked)}"><span>${label}</span></label>`)}
        </div>
      </div>
    `;
  }
}

if (!customElements.get("custom-media-card")) customElements.define("custom-media-card", CustomMediaCard);
if (!customElements.get("custom-media-card-editor")) customElements.define("custom-media-card-editor", CustomMediaCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "custom-media-card",
  name: "Custom Media Player Card",
  description: "A customizable media player card with album artwork and a visual editor.",
  preview: true,
  documentationURL: "https://github.com/anazario93/ha-custom-media-card"
});

console.info(`%c CUSTOM-MEDIA-CARD %c ${CARD_VERSION} `, "color: white; background: #2874a6; font-weight: bold;", "color: #2874a6; font-weight: bold;");
