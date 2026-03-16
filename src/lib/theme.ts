import type { DeliverableCustomer } from "./registry";

export interface CustomerBranding {
  company?: string;
  accentColor?: string;
  accentColorLight?: string;
  accentColorDark?: string;
  url?: string;
  logo?: string;
}

export interface ResolvedTheme {
  company: string;
  accentColor: string;
  accentColorLight: string;
  accentColorDark: string;
  url: string;
  logo?: string;
}

const SPRINT_ZERO_DEFAULTS: ResolvedTheme = {
  company: "Sprint Zero",
  accentColor: "#f97316",
  accentColorLight: "#fb923c",
  accentColorDark: "#ea580c",
  url: "https://sprintzero.sh",
};

export function resolveTheme(customer?: DeliverableCustomer): ResolvedTheme {
  const branding = customer?.branding;
  if (!branding) return SPRINT_ZERO_DEFAULTS;

  return {
    ...SPRINT_ZERO_DEFAULTS,
    ...Object.fromEntries(
      Object.entries(branding).filter(([, v]) => v !== undefined),
    ),
  };
}

export function buildThemeStyleOverrides(
  theme: ResolvedTheme,
): Record<string, string> | undefined {
  if (
    theme.accentColor === SPRINT_ZERO_DEFAULTS.accentColor &&
    theme.accentColorLight === SPRINT_ZERO_DEFAULTS.accentColorLight &&
    theme.accentColorDark === SPRINT_ZERO_DEFAULTS.accentColorDark
  ) {
    return undefined;
  }

  return {
    "--color-sz-orange": theme.accentColor,
    "--color-sz-orange-light": theme.accentColorLight,
    "--color-sz-orange-dark": theme.accentColorDark,
  };
}
