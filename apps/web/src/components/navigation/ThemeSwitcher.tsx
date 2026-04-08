"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { t } from "@/lib/i18n";
import { resolveClientLocale } from "@/lib/locale";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/use-theme";

interface ThemeSwitcherProps {
  compact?: boolean;
}

export function ThemeSwitcher({ compact = false }: ThemeSwitcherProps) {
  const { theme, resolvedTheme, systemTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const locale = resolveClientLocale();
  const m = t(locale);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button type="button" variant="outline" size="icon" className="opacity-50" disabled aria-label={`${m.nav.theme} loading`}>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  const options: Array<{ value: "light" | "dark" | "system"; label: string }> = [
    { value: "light", label: m.nav.themeLight },
    { value: "dark", label: m.nav.themeDark },
    { value: "system", label: m.nav.themeSystem },
  ];
  const currentResolved = theme === "system" ? (systemTheme ?? resolvedTheme ?? "system") : (theme ?? resolvedTheme ?? "system");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={compact ? "icon" : "default"} aria-label={m.nav.theme}>
          <div className="relative flex items-center">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </div>
          {compact ? null : <span className="ml-2">{m.nav.theme}</span>}
          <span className="sr-only">{m.nav.theme}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => setTheme(option.value)}>
            {option.label}
            <span
              className="ml-auto text-xs"
              aria-hidden="true"
              style={{ opacity: option.value === "system" ? (theme === "system" ? 1 : 0) : (currentResolved === option.value ? 1 : 0) }}
            >
              ✓
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
