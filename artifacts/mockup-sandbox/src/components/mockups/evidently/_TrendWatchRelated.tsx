// "Read the brief" callout shown at the foot of each Trend Watch
// archive issue. Resolves the article's component name to one or more
// ingredient/supplement briefs via the TREND_WATCH_TARGETS map in
// _links, and renders them as anchored cards. If the article has no
// targets (or none of them are built yet), the component renders
// nothing — Trend Watch issues whose subjects have no brief on the
// site (e.g. microneedling, beef tallow) stay clean.

import React from "react";
import { ArrowRight } from "lucide-react";
import { T } from "./_theme";
import { Container, Eyebrow, SERIF, SERIF_ED, SANS, MONO } from "./_chrome";
import { trendWatchLinksFor } from "./_links";

type TrendWatchRelatedProps = {
  /** The article's component file name, e.g. "TrendWatch013".
   *  Matches the keys in TREND_WATCH_TARGETS and SUPPLEMENT/INGREDIENT
   *  registries. */
  component: string;
};

export const TrendWatchRelated: React.FC<TrendWatchRelatedProps> = ({ component }) => {
  const links = trendWatchLinksFor(component);
  if (links.length === 0) return null;

  return (
    <section className="relative z-10 border-y py-16" style={{ borderColor: T.rule, background: T.paper2 }}>
      <Container>
        <div className="border-b pb-5 mb-8 flex items-end justify-between gap-6" style={{ borderColor: T.rule }}>
          <div>
            <Eyebrow color={T.accent}>Cross-reference · Read the brief</Eyebrow>
            <h2 className="mt-3" style={{ fontFamily: SERIF, fontSize: 36, lineHeight: 1.1, fontWeight: 400, color: T.ink, fontVariationSettings: '"opsz" 144, "SOFT" 30', letterSpacing: "-0.025em" }}>
              The full {links.length === 1 ? "brief" : "briefs"}{" "}
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>behind the verdict.</span>
            </h2>
          </div>
          <span className="hidden md:block" style={{ fontFamily: MONO, fontSize: 10.5, color: T.mutedSoft, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {links.length} linked {links.length === 1 ? "page" : "pages"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
          {links.map((l) => (
            <a
              key={`${l.kind}-${l.slug}`}
              href={l.href}
              className="group flex flex-col p-6 border-r border-b"
              style={{ borderColor: T.rule, background: T.paper }}
            >
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase" }}>
                {l.kind === "ingredient" ? "Ingredient brief" : "Supplement brief"}
              </span>
              <div className="mt-3" style={{ fontFamily: SERIF, fontSize: 24, lineHeight: 1.2, color: T.ink, fontVariationSettings: '"opsz" 144' }}>
                {l.name}
              </div>
              <div className="mt-auto pt-6 border-t" style={{ borderColor: T.ruleSoft }}>
                <span className="inline-flex items-center gap-1.5 group-hover:gap-2 transition-all" style={{ fontFamily: SANS, fontSize: 12.5, color: T.accent, fontWeight: 500 }}>
                  Read the {l.kind === "ingredient" ? "ingredient" : "supplement"} brief <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default TrendWatchRelated;
