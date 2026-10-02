/**
 * Token lists for the /design page. Class names are written out in full so
 * Tailwind generates them; the values themselves live in globals.css.
 */

export interface ColorToken {
  name: string;
  /** Background utility that paints the swatch. */
  className: string;
  /** For semantic tokens: the palette colour it points to. */
  alias?: string;
  /** What the token is for. */
  use?: string;
}

export const PALETTE: { group: string; colors: ColorToken[] }[] = [
  {
    group: "Neutrals",
    colors: [
      { name: "white", className: "bg-white" },
      { name: "paper", className: "bg-paper" },
      { name: "sand", className: "bg-sand" },
      { name: "hairline", className: "bg-hairline" },
      { name: "alloy", className: "bg-alloy" },
      { name: "steel", className: "bg-steel" },
      { name: "graphite", className: "bg-graphite" },
      { name: "ink", className: "bg-ink" },
      { name: "carbon", className: "bg-carbon" },
      { name: "night", className: "bg-night" },
    ],
  },
  {
    group: "Ember",
    colors: [
      { name: "ember-50", className: "bg-ember-50" },
      { name: "ember-200", className: "bg-ember-200" },
      { name: "ember-500", className: "bg-ember-500" },
      { name: "ember-600", className: "bg-ember-600" },
      { name: "ember-700", className: "bg-ember-700" },
    ],
  },
  {
    group: "Verdant and amber",
    colors: [
      { name: "verdant-50", className: "bg-verdant-50" },
      { name: "verdant-600", className: "bg-verdant-600" },
      { name: "amber-50", className: "bg-amber-50" },
      { name: "amber-400", className: "bg-amber-400" },
      { name: "amber-600", className: "bg-amber-600" },
    ],
  },
];

export const SEMANTIC_COLORS: { group: string; colors: ColorToken[] }[] = [
  {
    group: "Surfaces",
    colors: [
      {
        name: "background",
        className: "bg-background",
        alias: "paper",
        use: "Page background",
      },
      {
        name: "surface",
        className: "bg-surface",
        alias: "white",
        use: "Cards, popovers, inputs",
      },
      {
        name: "surface-muted",
        className: "bg-surface-muted",
        alias: "sand",
        use: "Tiles, hover fills, skeletons",
      },
      {
        name: "surface-inverse",
        className: "bg-surface-inverse",
        alias: "night",
        use: "Dark panels and heroes",
      },
    ],
  },
  {
    group: "Text",
    colors: [
      {
        name: "foreground",
        className: "bg-foreground",
        alias: "carbon",
        use: "Headings and body",
      },
      {
        name: "foreground-secondary",
        className: "bg-foreground-secondary",
        alias: "ink",
        use: "Dark button hover",
      },
      {
        name: "muted",
        className: "bg-muted",
        alias: "graphite",
        use: "Supporting text",
      },
      {
        name: "placeholder",
        className: "bg-placeholder",
        alias: "steel",
        use: "Decorative only, below AA",
      },
      {
        name: "on-inverse",
        className: "bg-on-inverse",
        alias: "white",
        use: "Text on dark surfaces",
      },
    ],
  },
  {
    group: "Lines",
    colors: [
      {
        name: "border",
        className: "bg-border",
        alias: "hairline",
        use: "Dividers, card outlines",
      },
      {
        name: "border-strong",
        className: "bg-border-strong",
        alias: "alloy",
        use: "Hover outlines, disabled text",
      },
    ],
  },
  {
    group: "Brand and status",
    colors: [
      {
        name: "accent",
        className: "bg-accent",
        alias: "ember-500",
        use: "Marks and decoration, never text",
      },
      {
        name: "accent-soft",
        className: "bg-accent-soft",
        alias: "ember-50",
        use: "Accent badge fill",
      },
      {
        name: "accent-on-inverse",
        className: "bg-accent-on-inverse",
        alias: "ember-200",
        use: "Accent text on dark",
      },
      {
        name: "primary",
        className: "bg-primary",
        alias: "ember-600",
        use: "Primary action, AA with white",
      },
      {
        name: "primary-hover",
        className: "bg-primary-hover",
        alias: "ember-700",
        use: "Primary action, hovered",
      },
      {
        name: "success",
        className: "bg-success",
        alias: "verdant-600",
        use: "Confirmation text and icons",
      },
      {
        name: "success-soft",
        className: "bg-success-soft",
        alias: "verdant-50",
        use: "Success badge fill",
      },
      {
        name: "highlight",
        className: "bg-highlight",
        alias: "amber-400",
        use: "Rating stars, highlights",
      },
    ],
  },
];

export const FONT_FAMILIES = [
  {
    name: "display",
    className: "font-display",
    family: "Instrument Serif",
    use: "Editorial headings and the wordmark",
  },
  {
    name: "sans",
    className: "font-sans",
    family: "Inter Tight",
    use: "Interface and body text",
  },
  {
    name: "mono",
    className: "font-mono",
    family: "JetBrains Mono",
    use: "Labels and vehicle specs",
  },
];

/** Largest first. `display` marks sizes that are set in the serif. */
export const TYPE_SCALE = [
  { name: "display", className: "text-display", display: true },
  { name: "h1", className: "text-h1", display: true },
  { name: "h2", className: "text-h2", display: true },
  { name: "h3", className: "text-h3", display: true },
  { name: "h4", className: "text-h4" },
  { name: "lead", className: "text-lead" },
  { name: "ui", className: "text-ui" },
  { name: "body", className: "text-body" },
  { name: "sm", className: "text-sm" },
  { name: "meta", className: "text-meta" },
  { name: "caption", className: "text-caption" },
  { name: "label", className: "text-label" },
];

export const RADII = [
  { name: "sm", className: "rounded-sm", use: "Tags" },
  { name: "md", className: "rounded-md", use: "Inputs, tiles" },
  { name: "lg", className: "rounded-lg", use: "Cards, photos" },
  { name: "xl", className: "rounded-xl", use: "Panels, popovers" },
  { name: "full", className: "rounded-full", use: "Buttons, badges" },
];

export const SHADOWS = [
  { name: "1", className: "shadow-1", use: "Badges on photos" },
  { name: "2", className: "shadow-2", use: "Open search field" },
  { name: "3", className: "shadow-3", use: "Popovers" },
  { name: "search", className: "shadow-search", use: "Search capsule" },
];
