// "Found in" section — lists catalogue products that contain a given ingredient.
// Used by ingredient detail pages so readers can jump from an ingredient
// brief to a reviewed product that uses it.

import React from "react";
import { ArrowRight } from "lucide-react";
import { T } from "./_theme";
import { Container, Eyebrow, Folio, TierBadge, Asterism, SERIF, SERIF_ED, SANS, MONO } from "./_chrome";
import { productsContainingIngredient, productHref } from "./_links";

type FoundInProps = {
  ingredientSlug: string;
  ingredientName: string;
  folio?: string;
  /** When true, wraps the section in a Container. The shared
   *  IngredientBrief layout already lives inside its own grid column,
   *  so it passes wrap={false}. */
  wrap?: boolean;
};

export const FoundIn: React.FC<FoundInProps> = ({
  ingredientSlug,
  ingredientName,
  folio = "§ 09",
  wrap = true,
}) => {
  // Only reviewed products surface here — the "Found in" section
  // links straight to the full review, so unreviewed catalogue
  // entries (purchase-link only) have nothing to point at.
  const products = productsContainingIngredient(ingredientSlug)
    .filter((p): p is typeof p & { component: string; tier: NonNullable<typeof p.tier> } =>
      Boolean(p.component) && Boolean(p.tier),
    );
  if (products.length === 0) return null;

  const body = (
    <article>
      <Folio n={folio} />
      <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.025em" }}>
        Found <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>in.</span>
      </h2>
      <p className="mt-5 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: T.inkSoft }}>
        {products.length} product{products.length === 1 ? "" : "s"} in the catalogue contain{products.length === 1 ? "s" : ""} {ingredientName}. Each link goes straight to the full review.
      </p>
      <div className="mt-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t" style={{ borderColor: T.rule }}>
        {products.map((p) => (
          <a key={p.component} href={productHref(p.component)} className="group flex flex-col p-6 border-r border-b" style={{ borderColor: T.rule, background: T.paper }}>
            <div className="flex items-start justify-between mb-3">
              <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>{p.brand}</span>
              <TierBadge tier={p.tier} />
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.25, color: T.ink, fontVariationSettings: '"opsz" 144' }}>{p.name}</div>
            <div className="mt-auto pt-5 border-t" style={{ borderColor: T.ruleSoft }}>
              <span className="inline-flex items-center gap-1.5 group-hover:gap-2 transition-all" style={{ fontFamily: SANS, fontSize: 12, color: T.accent }}>
                Read review <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </a>
        ))}
      </div>
      <div className="mt-4" style={{ fontFamily: MONO, fontSize: 10, color: T.mutedSoft, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        Cross-link · Catalogue v1.0
      </div>
    </article>
  );

  if (!wrap) {
    return (
      <>
        <Asterism />
        {body}
      </>
    );
  }

  return (
    <section className="relative z-10 border-b py-20" style={{ borderColor: T.rule, background: T.paper2 }}>
      <Container>
        <Eyebrow color={T.accent}>Cross-reference</Eyebrow>
        <div className="mt-4">{body}</div>
      </Container>
    </section>
  );
};

export default FoundIn;
