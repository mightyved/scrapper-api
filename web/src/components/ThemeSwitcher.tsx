import { Check, Palette } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeChoice = "aurora" | "graphite" | "midnight";
type BackgroundChoice = "glow" | "grid" | "clean";

type ThemeOption = {
  label: string;
  value: ThemeChoice;
  swatches: string[];
};

type BackgroundOption = {
  label: string;
  value: BackgroundChoice;
};

const themeStorageKey = "job-tracker-theme";
const backgroundStorageKey = "job-tracker-background";

const themeOptions: ThemeOption[] = [
  { label: "Aurora", value: "aurora", swatches: ["#0f766e", "#1d6fa5", "#a33464"] },
  { label: "Graphite", value: "graphite", swatches: ["#111827", "#0e7490", "#b45309"] },
  { label: "Midnight", value: "midnight", swatches: ["#0b1120", "#38bdf8", "#f472b6"] }
];

const backgroundOptions: BackgroundOption[] = [
  { label: "Glow", value: "glow" },
  { label: "Grid", value: "grid" },
  { label: "Clean", value: "clean" }
];

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeChoice>(() => readStoredValue(themeStorageKey, themeOptions, "aurora"));
  const [background, setBackground] = useState<BackgroundChoice>(() =>
    readStoredValue(backgroundStorageKey, backgroundOptions, "glow")
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.background = background;
    window.localStorage.setItem(backgroundStorageKey, background);
  }, [background]);

  return (
    <div className="theme-switcher">
      <button
        className="icon-button theme-trigger"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label="Change theme"
      >
        <Palette size={18} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="theme-popover" role="dialog" aria-label="Theme settings">
          <div className="theme-popover__section">
            <p className="section-label">Theme</p>
            <div className="theme-option-grid">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={theme === option.value ? "theme-option is-active" : "theme-option"}
                  onClick={() => setTheme(option.value)}
                  aria-pressed={theme === option.value}
                >
                  <span className="theme-option__swatches" aria-hidden="true">
                    {option.swatches.map((swatch) => (
                      <span key={swatch} style={{ backgroundColor: swatch }} />
                    ))}
                  </span>
                  <span>{option.label}</span>
                  {theme === option.value ? <Check size={15} aria-hidden="true" /> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="theme-popover__section">
            <p className="section-label">Background</p>
            <div className="background-option-grid">
              {backgroundOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={background === option.value ? "background-option is-active" : "background-option"}
                  onClick={() => setBackground(option.value)}
                  aria-pressed={background === option.value}
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function readStoredValue<T extends string>(
  key: string,
  options: Array<{ value: T }>,
  fallback: T
): T {
  try {
    const storedValue = window.localStorage.getItem(key);
    return options.some((option) => option.value === storedValue) ? (storedValue as T) : fallback;
  } catch {
    return fallback;
  }
}
