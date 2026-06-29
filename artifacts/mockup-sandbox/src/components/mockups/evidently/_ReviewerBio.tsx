import React from "react";
import { T } from "./_theme";
import { Container, Folio, SERIF, SERIF_ED, SANS, MONO } from "./_chrome";
import { Reviewer } from "./_reviewers";

export const scrollToReviewerBio = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  const el = document.getElementById("reviewer-bio");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  if (typeof window !== "undefined" && window.history?.replaceState) {
    window.history.replaceState(null, "", "#reviewer-bio");
  }
};

export const ReviewerBioSection: React.FC<{
  reviewer: Reviewer;
  filed: string;
  folio: string;
}> = ({ reviewer, filed, folio }) => (
  <section
    id="reviewer-bio"
    className="relative z-10 border-b py-20"
    style={{ borderColor: T.rule, background: T.paper2, scrollMarginTop: 24 }}
  >
    <Container>
      <Folio>{folio}</Folio>
      <h2 className="mt-2" style={{ fontFamily: SERIF, fontSize: 56, lineHeight: 1, fontWeight: 400, fontVariationSettings: '"opsz" 144, "SOFT" 30', color: T.ink, letterSpacing: "-0.03em" }}>
        Reviewed <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED }}>by.</span>
      </h2>
      <div className="mt-10 grid grid-cols-12 gap-8 border-t pt-10" style={{ borderColor: T.rule }}>
        <div className="col-span-12 md:col-span-3">
          {reviewer.headshotUrl ? (
            <img src={reviewer.headshotUrl} alt={`Headshot of ${reviewer.name}`} className="w-full" style={{ aspectRatio: "1 / 1", objectFit: "cover", border: `1px solid ${T.rule}`, background: T.paper }} />
          ) : (
            <div className="flex items-center justify-center w-full" style={{ aspectRatio: "1 / 1", border: `1px solid ${T.rule}`, background: T.paper }}>
              <span style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 96, lineHeight: 1, color: T.accent, fontVariationSettings: '"opsz" 144' }}>{reviewer.headshotInitials}</span>
            </div>
          )}
          <div className="mt-4" style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: T.mutedSoft, textTransform: "uppercase" }}>Reviewer</div>
          <div className="mt-1" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: T.muted, textTransform: "uppercase" }}>Filed {filed}</div>
        </div>
        <div className="col-span-12 md:col-span-9">
          <div style={{ fontFamily: SANS, fontSize: 13, letterSpacing: "0.18em", color: T.muted, textTransform: "uppercase", fontWeight: 600 }}>{reviewer.title}</div>
          <h3 className="mt-2" style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1.05, fontWeight: 400, color: T.ink, letterSpacing: "-0.03em", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
            {reviewer.name}
            {reviewer.credentials && (
              <span style={{ fontStyle: "italic", color: T.accent, fontFamily: SERIF_ED, fontSize: 30, marginLeft: 12 }}>{reviewer.credentials}</span>
            )}
          </h3>
          {reviewer.affiliations.length > 0 && (
            <ul className="mt-5 border-t" style={{ borderColor: T.ruleSoft }}>
              {reviewer.affiliations.map((a) => (
                <li key={a} className="border-b py-2.5" style={{ borderColor: T.ruleSoft, fontFamily: SERIF, fontSize: 15, color: T.inkSoft, fontStyle: "italic" }}>{a}</li>
              ))}
            </ul>
          )}
          {reviewer.bio && (
            <p className="mt-7 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.6, color: T.inkSoft }}>{reviewer.bio}</p>
          )}
          {reviewer.disclosures && (
            <div className="mt-8 border-t pt-5" style={{ borderColor: T.rule }}>
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: T.mutedSoft, textTransform: "uppercase" }}>Disclosures</div>
              <p className="mt-2 max-w-2xl" style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.6, color: T.muted, fontStyle: "italic" }}>{reviewer.disclosures}</p>
            </div>
          )}
        </div>
      </div>
    </Container>
  </section>
);

export const ReviewerSidebarCredit: React.FC<{
  reviewer: Reviewer;
  filed: string;
}> = ({ reviewer, filed }) => {
  const reviewerLine = reviewer.credentials
    ? `${reviewer.name}, ${reviewer.credentials}`
    : reviewer.name;
  return (
    <div className="px-6 py-5" style={{ background: T.paper2, borderTop: `1px solid ${T.rule}` }}>
      <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: T.mutedSoft, textTransform: "uppercase" }}>Reviewed by</div>
      <a href="#reviewer-bio" onClick={scrollToReviewerBio} className="mt-1 block" style={{ fontFamily: SERIF_ED, fontStyle: "italic", fontSize: 20, lineHeight: 1.2, color: T.ink, textDecoration: "underline", textUnderlineOffset: 4, textDecorationColor: T.rule, fontVariationSettings: '"opsz" 144' }}>
        {reviewerLine}
      </a>
      <div className="mt-2" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.muted, textTransform: "uppercase" }}>
        Filed {filed}
      </div>
    </div>
  );
};
