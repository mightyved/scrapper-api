import type { RegionFilter as RegionFilterValue } from "../lib/jobs";

const regions: RegionFilterValue[] = ["All", "Urgent", "APAC", "LATAM", "EMEA", "Japan", "Vietnam", "Worldwide", "Startup"];

type RegionFilterProps = {
  selectedRegion: RegionFilterValue;
  onRegionChange: (region: RegionFilterValue) => void;
  regionCounts?: Partial<Record<RegionFilterValue, number>>;
};

export function RegionFilter({ selectedRegion, onRegionChange, regionCounts = {} }: RegionFilterProps) {
  return (
    <div className="region-filter" role="tablist" aria-label="Region filter">
      {regions.map((region) => (
        <button
          key={region}
          type="button"
          className={region === selectedRegion ? "region-filter__button is-active" : "region-filter__button"}
          aria-selected={region === selectedRegion}
          role="tab"
          onClick={() => onRegionChange(region)}
        >
          <span>{region}</span>
          <span className="region-filter__count">{regionCounts[region] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
