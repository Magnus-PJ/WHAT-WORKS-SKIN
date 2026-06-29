export const T = {
  paper: "#fafaf7",
  paper2: "#f4f2eb",
  paper3: "#efece3",
  ink: "#111214",
  inkSoft: "#2a2c33",
  muted: "#5a5c61",
  mutedSoft: "#8a8c92",
  rule: "#e4e2db",
  ruleSoft: "#ecebe4",
  accent: "#0f766e",
  accentSoft: "#e6f4f2",
  accentDeep: "#0b5852",
  tierA: "#047857",
  tierAsoft: "#e6f4ee",
  tierB: "#b45309",
  tierBsoft: "#fdf2e3",
  tierC: "#475569",
  tierCsoft: "#eef1f4",
  tierD: "#9f1239",
  tierDsoft: "#fbe8ec",
  warning: "#c2410c",
  warningSoft: "#fdf3ec",
  danger: "#9f1239",
  dangerSoft: "#fbe8ec",
  ok: "#047857",
  okSoft: "#e6f4ee",
  invertBg: "#111214",
  invertFg: "#fafaf7",
  invertMuted: "#6b6e75",
  invertAccent: "#5eead4",
};

export const F = {
  serif: "'Fraunces', ui-serif, Georgia, serif",
  serifEd: "'Instrument Serif', 'Fraunces', ui-serif, Georgia, serif",
  sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

export const tierColor = (t: string) =>
  ({ A: T.tierA, B: T.tierB, C: T.tierC, D: T.tierD } as Record<string, string>)[t.toUpperCase()] || T.tierC;
export const tierBg = (t: string) =>
  ({ A: T.tierAsoft, B: T.tierBsoft, C: T.tierCsoft, D: T.tierDsoft } as Record<string, string>)[t.toUpperCase()] || T.tierCsoft;
