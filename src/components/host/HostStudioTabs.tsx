"use client";

import { useState, type ReactNode } from "react";

export type HostStudioTab = "design" | "guests" | "share" | "dayof";

const TABS: { id: HostStudioTab; labelKey: "tabDesign" | "tabGuests" | "tabShare" | "tabDayOf" }[] = [
  { id: "design", labelKey: "tabDesign" },
  { id: "guests", labelKey: "tabGuests" },
  { id: "share", labelKey: "tabShare" },
  { id: "dayof", labelKey: "tabDayOf" },
];

export default function HostStudioTabs({
  labels,
  design,
  guests,
  share,
  dayOf,
  dayOfEmpty,
  hasRsvps,
}: {
  labels: Record<(typeof TABS)[number]["labelKey"], string>;
  design: ReactNode;
  guests: ReactNode;
  share: ReactNode;
  dayOf: ReactNode;
  dayOfEmpty: string;
  hasRsvps: boolean;
}) {
  const [tab, setTab] = useState<HostStudioTab>("design");

  return (
    <div>
      <div className="sticky top-[57px] z-10 border-b border-white/10 bg-[var(--ink)]/95 backdrop-blur-md">
        <div
          role="tablist"
          aria-label="Host studio"
          className="mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-3 py-2 sm:px-6"
        >
          {TABS.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`studio-tab-${item.id}`}
                aria-selected={selected}
                aria-controls={`studio-panel-${item.id}`}
                onClick={() => setTab(item.id)}
                className={`shrink-0 rounded-md px-3 py-1.5 text-sm ${
                  selected
                    ? "bg-[var(--champagne)] font-medium text-[var(--ink)]"
                    : "text-[var(--mist)] hover:bg-white/5 hover:text-[var(--ivory)]"
                }`}
              >
                {labels[item.labelKey]}
              </button>
            );
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        id="studio-panel-design"
        aria-labelledby="studio-tab-design"
        hidden={tab !== "design"}
      >
        {design}
      </div>
      <div
        role="tabpanel"
        id="studio-panel-guests"
        aria-labelledby="studio-tab-guests"
        hidden={tab !== "guests"}
        className="mx-auto max-w-[1600px] space-y-10 px-4 py-8 sm:px-6"
      >
        {guests}
      </div>
      <div
        role="tabpanel"
        id="studio-panel-share"
        aria-labelledby="studio-tab-share"
        hidden={tab !== "share"}
        className="mx-auto max-w-[1600px] space-y-10 px-4 py-8 sm:px-6"
      >
        {share}
      </div>
      <div
        role="tabpanel"
        id="studio-panel-dayof"
        aria-labelledby="studio-tab-dayof"
        hidden={tab !== "dayof"}
        className="mx-auto max-w-[1600px] space-y-10 px-4 py-8 pb-24 sm:px-6 sm:pb-16"
      >
        {hasRsvps ? (
          dayOf
        ) : (
          <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-5 text-sm text-[var(--mist)]">
            {dayOfEmpty}
          </p>
        )}
      </div>
    </div>
  );
}
