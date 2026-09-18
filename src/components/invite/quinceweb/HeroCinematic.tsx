import { safeInviteImageUrl } from "@/lib/safe-image-url";
import { QUINCE_PRINCESA_ASSETS } from "./assets";

function isPetalAsset(url?: string) {
  if (!url) return true;
  return /petals?-/.test(url);
}

export default function HeroCinematic({
  name,
  misXv,
  photoUrl,
  photoAlt,
  heroImage,
  dateLabel,
  metaLabel,
  scrollLabel,
}: {
  name: string;
  misXv: string;
  photoUrl?: string;
  photoAlt: string;
  heroImage?: string;
  dateLabel?: string;
  metaLabel?: string;
  scrollLabel: string;
}) {
  const portrait = safeInviteImageUrl(photoUrl);
  const customHero = safeInviteImageUrl(heroImage);
  const atmosphere =
    portrait ||
    (customHero && !isPetalAsset(customHero)
      ? customHero
      : QUINCE_PRINCESA_ASSETS.gownAtmosphere);
  const isPortrait = Boolean(portrait);

  return (
    <section className="qw-hero" id="hero">
      <div
        className={`qw-hero-media${isPortrait ? " is-portrait" : " is-atmosphere"}`}
        aria-hidden={!isPortrait}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={atmosphere} alt={isPortrait ? photoAlt : ""} />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="qw-hero-petals"
        src={QUINCE_PRINCESA_ASSETS.petalsDrift}
        alt=""
        aria-hidden
      />
      <div className="qw-hero-wash" aria-hidden />
      <div className="qw-hero-vignette" aria-hidden />
      <div className="qw-hero-copy">
        <p className="qw-hero-kicker">{misXv}</p>
        <span className="qw-hairline" aria-hidden />
        <h1 className="qw-hero-name">{name}</h1>
        <span className="qw-hairline" aria-hidden />
        {dateLabel ? <p className="qw-hero-date">{dateLabel}</p> : null}
        {metaLabel ? <p className="qw-hero-meta">{metaLabel}</p> : null}
      </div>
      <a className="qw-scroll-cue" href="#padres" aria-label={scrollLabel}>
        <span />
      </a>
    </section>
  );
}
