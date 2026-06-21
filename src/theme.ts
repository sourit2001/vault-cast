import { VaultCastTheme } from "./types";

export const THEME_OPTIONS: Array<{ value: VaultCastTheme; label: string }> = [
  { value: "default", label: "Default" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn" },
  { value: "winter", label: "Winter" }
];

export function themeClass(theme: VaultCastTheme): string {
  return `vaultcast-theme-${theme}`;
}

export function themeLabel(theme: VaultCastTheme): string {
  return THEME_OPTIONS.find((option) => option.value === theme)?.label ?? "Default";
}
