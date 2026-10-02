import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  Link2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Target,
  TrendingUp
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  addJobSource,
  fetchJobs,
  fetchSources,
  filterJobsByRegion,
  getJobPlatformName,
  getPlatformHomeUrl,
  getPlatformNameFromSource,
  groupJobsByRecentDay,
  isUrgentHiringJob,
  type Job,
  type JobSourceRecord,
  type RegionFilter
} from "../lib/jobs";
import { JobCard } from "./JobCard";
import { PlatformSidebar, type PlatformOption } from "./PlatformSidebar";
import { RegionFilter as RegionFilterControl } from "./RegionFilter";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { ToastViewport, type ToastMessage } from "./ToastViewport";

const jobsPerPage = 12;
const regionOptions: RegionFilter[] = ["All", "Urgent", "APAC", "LATAM", "EMEA", "Japan", "Vietnam", "Worldwide", "Startup"];

type SourceFilter = "all" | "linkedin" | "other";
type SortMode = "score" | "newest";
type LoadJobsReason = "auto" | "initial" | "manual";

type LoadJobsOptions = {
  reason?: LoadJobsReason;
  showLoading?: boolean;
};

const sourceFilters: Array<{ value: SourceFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "other", label: "Other" }
];

const sortModes: Array<{ value: SortMode; label: string; icon: ReactNode }> = [
  { value: "score", label: "Best match", icon: <Target size={16} aria-hidden="true" /> },
  { value: "newest", label: "Newest", icon: <Clock3 size={16} aria-hidden="true" /> }
];

export function JobDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sources, setSources] = useState<JobSourceRecord[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>("All");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("score");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingPlatform, setIsAddingPlatform] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [platformAddError, setPlatformAddError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const loadedOnceRef = useRef(false);
  const jobIdsRef = useRef<Set<string>>(new Set());

  function dismissToast(id: string) {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }

  function pushToast(message: Omit<ToastMessage, "id">) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setToasts((currentToasts) => [...currentToasts.slice(-2), { ...message, id }]);
    window.setTimeout(() => dismissToast(id), 4800);
  }

  async function loadJobs(options: LoadJobsOptions = {}) {
    const reason = options.reason ?? "manual";
    const showLoading = options.showLoading ?? reason !== "auto";

    if (showLoading) {
      setIsLoading(true);
    }

    if (reason !== "auto") {
      setErrorMessage(null);
    }

    try {
      const [nextJobs, nextSources] = await Promise.all([
        fetchJobs(),
        fetchSources().catch(() => [] as JobSourceRecord[])
      ]);
      const previousJobIds = jobIdsRef.current;
      const newJobs = nextJobs.filter((job) => !previousJobIds.has(job.id));
      const wasLoaded = loadedOnceRef.current;

      setJobs(nextJobs);
      setSources(nextSources);
      setLastLoadedAt(new Date());
      jobIdsRef.current = new Set(nextJobs.map((job) => job.id));
      loadedOnceRef.current = true;

      if (!wasLoaded) {
        pushToast({
          detail: `${nextJobs.length.toLocaleString()} positions ready.`,
          title: "Job tracker loaded",
          tone: "success"
        });
      } else if (newJobs.length > 0) {
        pushToast({
          detail: reason === "manual" ? "Refresh completed." : "Background sync updated the queue.",
          title: `${newJobs.length.toLocaleString()} new ${newJobs.length === 1 ? "position" : "positions"} added`,
          tone: "success"
        });
      } else if (reason === "manual") {
        pushToast({
          detail: "Your local queue is already up to date.",
          title: "No new positions",
          tone: "info"
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load jobs";

      if (reason !== "auto") {
        setErrorMessage(message);
        pushToast({
          detail: message,
          title: "Unable to refresh jobs",
          tone: "error"
        });
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadJobs({ reason: "initial" });

    const refreshTimer = window.setInterval(() => {
      void loadJobs({ reason: "auto", showLoading: false });
    }, 60_000);

    return () => window.clearInterval(refreshTimer);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [jobs, searchQuery, selectedPlatforms, selectedRegion, sortMode, sourceFilter]);

  const searchFilteredJobs = useMemo(
    () => jobs.filter((job) => matchesSearch(job, searchQuery)),
    [jobs, searchQuery]
  );
  const recentSearchJobs = useMemo(
    () => groupJobsByRecentDay(searchFilteredJobs).flatMap((bucket) => bucket.jobs),
    [searchFilteredJobs]
  );
  const platformOptions = useMemo(
    () => buildPlatformOptions(sources, recentSearchJobs),
    [recentSearchJobs, sources]
  );
  const platformFilteredJobs = useMemo(
    () => searchFilteredJobs.filter((job) => matchesPlatformSelection(job, selectedPlatforms)),
    [searchFilteredJobs, selectedPlatforms]
  );
  const recentPlatformJobs = useMemo(
    () => groupJobsByRecentDay(platformFilteredJobs).flatMap((bucket) => bucket.jobs),
    [platformFilteredJobs]
  );
  const sourceCounts = useMemo(() => countSources(recentPlatformJobs), [recentPlatformJobs]);
  const sourceFilteredJobs = useMemo(
    () => platformFilteredJobs.filter((job) => matchesSourceFilter(job, sourceFilter)),
    [platformFilteredJobs, sourceFilter]
  );
  const recentSourceFilteredJobs = useMemo(
    () => groupJobsByRecentDay(sourceFilteredJobs).flatMap((bucket) => bucket.jobs),
    [sourceFilteredJobs]
  );
  const regionCounts = useMemo(() => countRegions(recentSourceFilteredJobs), [recentSourceFilteredJobs]);
  const recentJobs = useMemo(
    () => sortJobs(filterJobsByRegion(recentSourceFilteredJobs, selectedRegion), sortMode),
    [recentSourceFilteredJobs, selectedRegion, sortMode]
  );
  const visibleJobCount = recentJobs.length;
  const totalPages = Math.max(1, Math.ceil(visibleJobCount / jobsPerPage));
  const pageStartIndex = (currentPage - 1) * jobsPerPage;
  const pageEndIndex = Math.min(pageStartIndex + jobsPerPage, visibleJobCount);
  const paginatedJobs = useMemo(
    () => recentJobs.slice(pageStartIndex, pageEndIndex),
    [pageEndIndex, pageStartIndex, recentJobs]
  );
  const currentPageJobIds = useMemo(() => new Set(paginatedJobs.map((job) => job.id)), [paginatedJobs]);
  const groupedJobs = useMemo(
    () =>
      groupJobsByRecentDay(recentJobs)
        .map((bucket) => ({
          ...bucket,
          jobs: sortJobs(
            bucket.jobs.filter((job) => currentPageJobIds.has(job.id)),
            sortMode
          )
        }))
        .filter((bucket) => bucket.jobs.length > 0),
    [currentPageJobIds, recentJobs, sortMode]
  );
  const activeFilters = useMemo(
    () => getActiveFilters(selectedRegion, sourceFilter, searchQuery, selectedPlatforms),
    [searchQuery, selectedPlatforms, selectedRegion, sourceFilter]
  );

  const averageScore =
    recentPlatformJobs.length > 0
      ? Math.round(recentPlatformJobs.reduce((total, job) => total + job.totalScore, 0) / recentPlatformJobs.length)
      : 0;
  const topScore = recentPlatformJobs.length > 0 ? Math.max(...recentPlatformJobs.map((job) => job.totalScore)) : 0;
  const freshCount = recentPlatformJobs.filter(isFreshJob).length;
  const urgentCount = recentPlatformJobs.filter(isUrgentHiringJob).length;
  const linkedInCount = recentPlatformJobs.filter(isLinkedInJob).length;
  const syncLabel = lastLoadedAt ? formatSyncTime(lastLoadedAt) : "Not synced";

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function goToPreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1));
  }

  function goToNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }

  function clearFilters() {
    setSelectedRegion("All");
    setSelectedPlatforms([]);
    setSourceFilter("all");
    setSearchQuery("");
  }

  function togglePlatform(platform: string) {
    setSelectedPlatforms((currentPlatforms) =>
      currentPlatforms.includes(platform)
        ? currentPlatforms.filter((currentPlatform) => currentPlatform !== platform)
        : [...currentPlatforms, platform].sort((a, b) => a.localeCompare(b))
    );
  }

  async function addPlatform(url: string) {
    setIsAddingPlatform(true);
    setPlatformAddError(null);

    try {
      const nextSource = await addJobSource(url);
      setSources((currentSources) => {
        const remainingSources = currentSources.filter((source) => source.id !== nextSource.id && source.url !== nextSource.url);
        return [...remainingSources, nextSource].sort((a, b) => a.name.localeCompare(b.name));
      });
    } catch (error) {
      setPlatformAddError(error instanceof Error ? error.message : "Unable to add job site");
      throw error;
    } finally {
      setIsAddingPlatform(false);
    }
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-hero" aria-labelledby="dashboard-title">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <Target size={22} />
          </span>
          <div>
            <p className="eyebrow">Job tracker</p>
            <h1 id="dashboard-title">Remote software roles across global markets</h1>
            <p className="hero-copy">A focused queue of recent remote jobs across LinkedIn, RSS feeds, and public boards.</p>
          </div>
        </div>

        <div className="hero-actions">
          <ThemeSwitcher />
          <span className="sync-pill">
            <Clock3 size={15} aria-hidden="true" />
            {syncLabel}
          </span>
          <button
            className="icon-button"
            type="button"
            onClick={() => void loadJobs({ reason: "manual" })}
            aria-label="Refresh jobs"
            disabled={isLoading}
          >
            <RefreshCw size={18} aria-hidden="true" />
          </button>
        </div>
      </section>

      <section className="summary-strip" aria-label="Job summary">
        <SummaryMetric
          icon={<BriefcaseBusiness size={18} aria-hidden="true" />}
          label="Available roles"
          value={recentSearchJobs.length}
          detail="Synced last 7 days"
          tone="neutral"
        />
        <SummaryMetric
          icon={<TrendingUp size={18} aria-hidden="true" />}
          label="Top match"
          value={topScore}
          detail={`Average ${averageScore}`}
          tone="coral"
        />
        <SummaryMetric
          icon={<Clock3 size={18} aria-hidden="true" />}
          label="Fresh roles"
          value={freshCount}
          detail="Last 24 hours"
          tone="green"
        />
        <SummaryMetric
          icon={<Flame size={18} aria-hidden="true" />}
          label="Urgent hiring"
          value={urgentCount}
          detail="Fast-moving roles"
          tone="rose"
        />
        <SummaryMetric
          icon={<Link2 size={18} aria-hidden="true" />}
          label="LinkedIn"
          value={linkedInCount}
          detail="In this view"
          tone="gold"
        />
      </section>

      <div className="workspace-grid">
        <div className="workspace-main">
          <section className="control-panel" aria-label="Job controls">
            <div className="control-panel__row control-panel__row--regions">
              <div>
                <p className="section-label">Region</p>
                <RegionFilterControl
                  selectedRegion={selectedRegion}
                  onRegionChange={setSelectedRegion}
                  regionCounts={regionCounts}
                />
              </div>
            </div>

            <div className="control-grid">
              <label className="search-control">
                <span className="section-label">Search</span>
                <span className="search-control__input">
                  <Search size={17} aria-hidden="true" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Role, company, source, keyword"
                  />
                </span>
              </label>

              <div className="filter-block">
                <p className="section-label">Source</p>
                <div className="segmented-control segmented-control--sources" role="group" aria-label="Source filter">
                  {sourceFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      className={filter.value === sourceFilter ? "is-active" : ""}
                      aria-pressed={filter.value === sourceFilter}
                      onClick={() => setSourceFilter(filter.value)}
                    >
                      <span>{filter.label}</span>
                      <strong>{sourceCounts[filter.value]}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-block">
                <p className="section-label">Sort</p>
                <div className="segmented-control" role="group" aria-label="Sort jobs">
                  {sortModes.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      className={mode.value === sortMode ? "is-active" : ""}
                      aria-pressed={mode.value === sortMode}
                      onClick={() => setSortMode(mode.value)}
                    >
                      {mode.icon}
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="results-shell" aria-label="Job results">
            <div className="results-header">
              <div>
                <p className="section-label">Queue</p>
                <h2>{getResultsTitle(selectedRegion)}</h2>
                {activeFilters.length > 0 ? (
                  <div className="active-filter-row" aria-label="Active filters">
                    {activeFilters.map((filter) => (
                      <span key={filter}>{filter}</span>
                    ))}
                    <button type="button" onClick={clearFilters}>
                      Clear
                    </button>
                  </div>
                ) : null}
              </div>

              {!isLoading && !errorMessage && visibleJobCount > 0 ? (
                <PaginationBar
                  currentPage={currentPage}
                  pageEndIndex={pageEndIndex}
                  pageStartIndex={pageStartIndex}
                  totalPages={totalPages}
                  visibleJobCount={visibleJobCount}
                  onNext={goToNextPage}
                  onPrevious={goToPreviousPage}
                />
              ) : null}
            </div>

            {isLoading ? (
              <div className="empty-state">
                <BriefcaseBusiness size={22} aria-hidden="true" />
                Loading jobs
              </div>
            ) : errorMessage ? (
              <div className="empty-state empty-state--error">{errorMessage}</div>
            ) : visibleJobCount === 0 ? (
              <div className="empty-state empty-state--actionable">
                <SlidersHorizontal size={22} aria-hidden="true" />
                <div>
                  <strong>No jobs match the current view.</strong>
                  <span>
                    {activeFilters.length > 0
                      ? `${recentSearchJobs.length} synced roles are available outside this exact filter set.`
                      : "No synced roles are available for the current search."}
                  </span>
                </div>
                {activeFilters.length > 0 ? (
                  <button type="button" onClick={clearFilters}>
                    Clear filters
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                <section className="timeline-list" aria-label="Jobs by posted date">
                  {groupedJobs.map((bucket) => (
                    <section className="timeline-group" key={bucket.id} aria-labelledby={`${bucket.id}-title`}>
                      <div className="timeline-group__heading">
                        <div>
                          <h2 id={`${bucket.id}-title`}>{bucket.label}</h2>
                          <p>{bucket.rangeLabel}</p>
                        </div>
                        <span>
                          <strong>{bucket.jobs.length}</strong>
                          roles
                        </span>
                      </div>

                      <div className="job-list">
                        {bucket.jobs.map((job) => (
                          <JobCard job={job} key={job.id} />
                        ))}
                      </div>
                    </section>
                  ))}
                </section>

                <PaginationBar
                  currentPage={currentPage}
                  pageEndIndex={pageEndIndex}
                  pageStartIndex={pageStartIndex}
                  totalPages={totalPages}
                  visibleJobCount={visibleJobCount}
                  onNext={goToNextPage}
                  onPrevious={goToPreviousPage}
                  variant="bottom"
                />
              </>
            )}
          </section>
        </div>

        <PlatformSidebar
          platforms={platformOptions}
          selectedPlatforms={selectedPlatforms}
          addError={platformAddError}
          isAddingPlatform={isAddingPlatform}
          onAddPlatform={addPlatform}
          onClear={() => setSelectedPlatforms([])}
          onTogglePlatform={togglePlatform}
        />
      </div>
      <ToastViewport messages={toasts} onDismiss={dismissToast} />
    </main>
  );
}

type SummaryMetricProps = {
  detail: string;
  icon: ReactNode;
  label: string;
  tone: "neutral" | "coral" | "green" | "gold" | "rose";
  value: number | string;
};

function SummaryMetric({ detail, icon, label, tone, value }: SummaryMetricProps) {
  return (
    <div className={`summary-card summary-card--${tone}`}>
      <span className="summary-card__icon">{icon}</span>
      <div>
        <span>{value}</span>
        <p>{label}</p>
        <small>{detail}</small>
      </div>
    </div>
  );
}

type PaginationBarProps = {
  currentPage: number;
  pageEndIndex: number;
  pageStartIndex: number;
  totalPages: number;
  visibleJobCount: number;
  onNext: () => void;
  onPrevious: () => void;
  variant?: "bottom";
};

function PaginationBar({
  currentPage,
  pageEndIndex,
  pageStartIndex,
  totalPages,
  visibleJobCount,
  onNext,
  onPrevious,
  variant
}: PaginationBarProps) {
  return (
    <div className={variant === "bottom" ? "pagination-bar pagination-bar--bottom" : "pagination-bar"} aria-label="Pagination">
      <p>
        Showing {pageStartIndex + 1}-{pageEndIndex} of {visibleJobCount}
      </p>

      <div className="pagination-controls">
        <button type="button" onClick={onPrevious} disabled={currentPage === 1} aria-label="Previous page">
          <ChevronLeft size={16} aria-hidden="true" />
          <span>Previous</span>
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button type="button" onClick={onNext} disabled={currentPage === totalPages} aria-label="Next page">
          <span>Next</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function countSources(jobs: Job[]): Record<SourceFilter, number> {
  const linkedIn = jobs.filter(isLinkedInJob).length;

  return {
    all: jobs.length,
    linkedin: linkedIn,
    other: jobs.length - linkedIn
  };
}

function countRegions(jobs: Job[]): Partial<Record<RegionFilter, number>> {
  return regionOptions.reduce<Partial<Record<RegionFilter, number>>>((counts, region) => {
    counts[region] = filterJobsByRegion(jobs, region).length;
    return counts;
  }, {});
}

function getResultsTitle(selectedRegion: RegionFilter): string {
  if (selectedRegion === "All") {
    return "All matching roles";
  }

  if (selectedRegion === "Urgent") {
    return "Urgent hiring roles";
  }

  return `${selectedRegion} roles`;
}

function getActiveFilters(
  selectedRegion: RegionFilter,
  sourceFilter: SourceFilter,
  searchQuery: string,
  selectedPlatforms: string[]
): string[] {
  const filters: string[] = [];
  const normalizedSearch = searchQuery.trim();

  if (selectedRegion !== "All") {
    filters.push(selectedRegion);
  }

  if (selectedPlatforms.length === 1) {
    filters.push(selectedPlatforms[0]);
  } else if (selectedPlatforms.length > 1) {
    filters.push(`${selectedPlatforms.length} platforms`);
  }

  if (sourceFilter !== "all") {
    filters.push(sourceFilter === "linkedin" ? "LinkedIn" : "Other sources");
  }

  if (normalizedSearch) {
    filters.push(`Search: ${normalizedSearch}`);
  }

  return filters;
}

function matchesSourceFilter(job: Job, sourceFilter: SourceFilter): boolean {
  if (sourceFilter === "all") {
    return true;
  }

  return sourceFilter === "linkedin" ? isLinkedInJob(job) : !isLinkedInJob(job);
}

function matchesPlatformSelection(job: Job, selectedPlatforms: string[]): boolean {
  return selectedPlatforms.length === 0 || selectedPlatforms.includes(getJobPlatformName(job));
}

function buildPlatformOptions(sources: JobSourceRecord[], jobs: Job[]): PlatformOption[] {
  const platforms = new Map<string, PlatformOption>();

  for (const source of sources) {
    const platformName = getPlatformNameFromSource(source);
    const existing = platforms.get(platformName);

    platforms.set(platformName, {
      enabled: Boolean(existing?.enabled || source.enabled),
      jobCount: existing?.jobCount ?? 0,
      lastFetchedAt: latestDateValue(existing?.lastFetchedAt, source.lastFetchedAt),
      name: platformName,
      primaryUrl: existing?.primaryUrl ?? getPlatformHomeUrl(source),
      sourceCount: (existing?.sourceCount ?? 0) + 1
    });
  }

  for (const job of jobs) {
    const platformName = getJobPlatformName(job);
    const existing = platforms.get(platformName);

    platforms.set(platformName, {
      enabled: existing?.enabled ?? true,
      jobCount: (existing?.jobCount ?? 0) + 1,
      lastFetchedAt: existing?.lastFetchedAt ?? null,
      name: platformName,
      primaryUrl: existing?.primaryUrl ?? getPlatformHomeUrl(job.source),
      sourceCount: existing?.sourceCount ?? 1
    });
  }

  return Array.from(platforms.values()).sort((a, b) => {
    if (a.enabled !== b.enabled) {
      return a.enabled ? -1 : 1;
    }

    return b.jobCount - a.jobCount || a.name.localeCompare(b.name);
  });
}

function matchesSearch(job: Job, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    job.title,
    job.companyName,
    job.description,
    job.locationText,
    job.remoteText,
    job.source.name,
    ...job.matchReasons,
    ...job.tags
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

function sortJobs(jobs: Job[], sortMode: SortMode): Job[] {
  return [...jobs].sort((a, b) => {
    const scoreDifference = b.totalScore - a.totalScore;
    const dateDifference = getDateValue(b.publishedAt) - getDateValue(a.publishedAt);

    return sortMode === "score" ? scoreDifference || dateDifference : dateDifference || scoreDifference;
  });
}

function isLinkedInJob(job: Job): boolean {
  return job.source.name.toLowerCase().includes("linkedin");
}

function isFreshJob(job: Job): boolean {
  const dateValue = getDateValue(job.publishedAt);

  if (dateValue === 0) {
    return false;
  }

  return Date.now() - dateValue < 24 * 60 * 60 * 1000;
}

function getDateValue(value: string | null): number {
  if (!value) {
    return 0;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function latestDateValue(currentValue: string | null | undefined, nextValue: string | null): string | null {
  if (!currentValue) {
    return nextValue;
  }

  if (!nextValue) {
    return currentValue;
  }

  return getDateValue(nextValue) > getDateValue(currentValue) ? nextValue : currentValue;
}

function formatSyncTime(value: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);
}
