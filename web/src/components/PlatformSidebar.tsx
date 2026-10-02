import { CheckSquare2, Database, ExternalLink, Plus, Search, Square, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

export type PlatformOption = {
  enabled: boolean;
  jobCount: number;
  lastFetchedAt: string | null;
  name: string;
  primaryUrl: string;
  sourceCount: number;
};

type PlatformSidebarProps = {
  platforms: PlatformOption[];
  selectedPlatforms: string[];
  addError: string | null;
  isAddingPlatform: boolean;
  onAddPlatform: (url: string) => Promise<void>;
  onClear: () => void;
  onTogglePlatform: (platform: string) => void;
};

export function PlatformSidebar({
  platforms,
  selectedPlatforms,
  addError,
  isAddingPlatform,
  onAddPlatform,
  onClear,
  onTogglePlatform
}: PlatformSidebarProps) {
  const [platformQuery, setPlatformQuery] = useState("");
  const [newPlatformUrl, setNewPlatformUrl] = useState("");
  const selectedSet = new Set(selectedPlatforms);
  const allSelected = selectedPlatforms.length === 0;
  const connectedCount = platforms.filter((platform) => platform.enabled).length;
  const visiblePlatforms = useMemo(
    () =>
      platforms.filter((platform) =>
        platform.name.toLowerCase().includes(platformQuery.trim().toLowerCase())
      ),
    [platformQuery, platforms]
  );

  async function submitNewPlatform(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextUrl = newPlatformUrl.trim();

    if (!nextUrl) {
      return;
    }

    try {
      await onAddPlatform(nextUrl);
      setNewPlatformUrl("");
    } catch {
      // The parent renders the inline error and keeps the typed URL intact.
    }
  }

  return (
    <aside className="platform-sidebar" aria-label="Job platforms">
      <div className="platform-sidebar__header">
        <div>
          <p className="section-label">Platforms</p>
          <h2>Job boards</h2>
        </div>
        <span className="platform-total">
          <Database size={15} aria-hidden="true" />
          {connectedCount}/{platforms.length}
        </span>
      </div>

      <label className="platform-search">
        <Search size={15} aria-hidden="true" />
        <input
          type="search"
          value={platformQuery}
          onChange={(event) => setPlatformQuery(event.target.value)}
          placeholder="Find platform"
        />
      </label>

      <form className="platform-add-form" onSubmit={(event) => void submitNewPlatform(event)}>
        <label>
          <span className="section-label">Add job site</span>
          <span className="platform-add-form__input">
            <input
              type="text"
              inputMode="url"
              value={newPlatformUrl}
              onChange={(event) => setNewPlatformUrl(event.target.value)}
              placeholder="https://example.com/jobs"
            />
            <button type="submit" disabled={isAddingPlatform || !newPlatformUrl.trim()} aria-label="Add job site">
              <Plus size={16} aria-hidden="true" />
            </button>
          </span>
        </label>
        {addError ? <p className="platform-add-form__error">{addError}</p> : null}
      </form>

      <button
        type="button"
        className={allSelected ? "platform-option platform-option--all is-active" : "platform-option platform-option--all"}
        aria-pressed={allSelected}
        onClick={onClear}
      >
        <span className="platform-option__check">{allSelected ? <CheckSquare2 size={18} /> : <Square size={18} />}</span>
        <span className="platform-option__name">All platforms</span>
        <strong>{platforms.reduce((total, platform) => total + platform.jobCount, 0)}</strong>
      </button>

      <div className="platform-list">
        {visiblePlatforms.map((platform) => {
          const isSelected = selectedSet.has(platform.name);
          const isActive = allSelected || isSelected;

          return (
            <div
              key={platform.name}
              className={[
                "platform-option",
                isActive ? "is-active" : "",
                platform.enabled ? "is-live" : "is-catalog"
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                className="platform-option__check"
                aria-label={`Filter ${platform.name}`}
                aria-pressed={isSelected}
                onClick={() => onTogglePlatform(platform.name)}
              >
                {isActive ? <CheckSquare2 size={18} aria-hidden="true" /> : <Square size={18} aria-hidden="true" />}
              </button>
              <a className="platform-option__body" href={platform.primaryUrl} target="_blank" rel="noreferrer">
                <span className="platform-option__name">{platform.name}</span>
                <small>
                  {platform.enabled ? "Live" : "Catalog"} - {platform.sourceCount}{" "}
                  {platform.sourceCount === 1 ? "source" : "sources"}
                </small>
              </a>
              <strong>{platform.jobCount}</strong>
              <a className="platform-option__open" href={platform.primaryUrl} target="_blank" rel="noreferrer" aria-label={`Open ${platform.name}`}>
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          );
        })}
      </div>

      {selectedPlatforms.length > 0 ? (
        <button type="button" className="platform-clear" onClick={onClear}>
          <X size={16} aria-hidden="true" />
          Clear platforms
        </button>
      ) : null}
    </aside>
  );
}
