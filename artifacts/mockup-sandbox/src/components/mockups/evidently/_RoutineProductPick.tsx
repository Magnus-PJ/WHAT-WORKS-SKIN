// Shared product-pick row used by every routine detail page's
// "Recommended" sidebar. Centralised here so:
//
//   * the markup stays visually identical across the 11 routine
//     pages (a previous refactor target — see _unreviewedShelf.ts);
//   * outbound shelf clicks emit the same `shelf_outbound_click`
//     payload as the ingredient briefs, with a routine-specific
//     `pageKind` / `pageSlug` so analytics can attribute the click
//     to the correct routine;
//   * adding a new routine page is a one-import affair: pass the
//     detail-page component file name as `pageSlug` and the row
//     handles tracking and external-link decoration.
//
// Internal "Read review" clicks (when a brand+name resolves to a
// catalogue product page) are deliberately not tracked — only
// brand / retailer outbound clicks emit an event.

import React from "react";
import { T } from "./_theme";
import { TierBadge, SERIF, SANS } from "./_chrome";
import {
  productLinkForBriefEntry,
  shelfOutboundClickHandler,
} from "./_links";

type Tier = "A" | "B" | "C" | "D";

type Pick = {
  brand: string;
  name: string;
  note: string;
  tier: Tier;
};

type Props = {
  p: Pick;
  /** The routine detail-page component file name, e.g.
   *  `RoutineBareMinimum`. Used as `pageSlug` so the analytics row
   *  identifies the source page; multiple catalogue slugs may alias
   *  the same component, so the component name is the unambiguous
   *  identifier. */
  pageSlug: string;
};

const RowBody: React.FC<{ p: Pick }> = ({ p }) => (
  <div className="flex items-start justify-between gap-2">
    <div>
      <div style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>{p.brand}</div>
      <div className="mt-1" style={{ fontFamily: SERIF, fontSize: 15, color: T.ink, lineHeight: 1.3 }}>{p.name}</div>
      <div className="mt-1" style={{ fontFamily: SERIF, fontSize: 12.5, color: T.muted, fontStyle: "italic" }}>{p.note}</div>
    </div>
    <TierBadge tier={p.tier} />
  </div>
);

export const RoutineProductPick: React.FC<Props> = ({ p, pageSlug }) => {
  const link = productLinkForBriefEntry(p.brand, p.name);
  const liCls = "border-b pb-4 last:border-b-0 last:pb-0";
  const liStyle = { borderColor: T.ruleSoft };

  // No catalogue match (no internal review and no purchase URL):
  // render exactly the historical non-link markup so unreviewed picks
  // look the same as before and nothing new gets tracked.
  if (!link) {
    return (
      <li className={liCls} style={liStyle}>
        <RowBody p={p} />
      </li>
    );
  }

  const externalProps = link.external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
  const onClick = shelfOutboundClickHandler(link, {
    brand: p.brand,
    productName: p.name,
    pageKind: "routine",
    pageSlug,
  });

  return (
    <li className={liCls} style={liStyle}>
      <a
        href={link.href}
        onClick={onClick}
        className="block"
        style={{ color: "inherit", textDecoration: "none" }}
        {...externalProps}
      >
        <RowBody p={p} />
      </a>
    </li>
  );
};

export default RoutineProductPick;
