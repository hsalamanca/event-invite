import { safeInviteImageUrl } from "@/lib/safe-image-url";
import { QUINCE_PRINCESA_ASSETS } from "./assets";

export default function HeroCinematic({
  name,
  misXv,
  photoUrl,
  photoAlt,
  heroImage,
  scrollLabel,
}: {
  name: string;
  misXv: string;
  photoUrl?: string;
  photoAlt: string;
  heroImage?: string;
  scrollLabel: string;
}) {
  const portrait = safeInviteImageUrl(photoUrl);
  const atmosphere = heroImage || QUINCE_PRINCESA_ASSETS.petalsDrift;

  return (
    <section className="qw-hero" id="hero">
      <div className="qw-hero-media" aria-hidden={!portrait}>
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={portrait} alt={photoAlt} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={atmosphere} alt="" />
        )}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="qw-hero-petals"
        src={QUINCE_PRINCESA_ASSETS.petalsDrift}
        alt=""
        aria-hidden
      />
      <div className="qw-hero-wash" aria-hidden />
      <div className="qw-hero-copy">
        <p className="qw-hero-kicker">{misXv}</p>
        <h1 className="qw-hero-name">{name}</h1>
      </div>
      <a className="qw-scroll-cue" href="#padres" aria-label={scrollLabel}>
        <span />
      </a>
    </section>
  );
}
