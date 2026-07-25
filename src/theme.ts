import { VaultCastTheme } from "./types";

export const THEME_OPTIONS: Array<{ value: VaultCastTheme; label: string }> = [
  { value: "stone", label: "Stone" },
  { value: "sage", label: "Sage" },
  { value: "wine", label: "Wine" },
  { value: "mist", label: "Mist" },
  { value: "mauve", label: "Mauve" }
];

export function themeClass(theme: VaultCastTheme): string {
  return `vaultcast-theme-${theme}`;
}

export function themeLabel(theme: VaultCastTheme): string {
  return THEME_OPTIONS.find((option) => option.value === theme)?.label ?? "Stone";
}

export function normalizeTheme(theme: unknown): VaultCastTheme {
  switch (theme) {
    case "stone":
    case "sage":
    case "wine":
    case "mist":
    case "mauve":
      return theme;
    case "spring":
      return "sage";
    case "summer":
      return "mist";
    case "autumn":
      return "wine";
    case "winter":
      return "mauve";
    case "default":
    default:
      return "stone";
  }
}
