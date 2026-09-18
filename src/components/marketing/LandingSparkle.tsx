const PETALS = [
  {
    src: "/templates/quince-princesa/petal-single.png",
    className: "landing-petal left-[8%] top-[18%] w-7 opacity-70",
    style: { animationDelay: "0s" },
  },
  {
    src: "/templates/quince-princesa/petal-single.png",
    className: "landing-petal right-[12%] top-[28%] w-6 opacity-60",
    style: { animationDelay: "2.4s" },
  },
  {
    src: "/templates/quince-princesa/petal-single.png",
    className: "landing-petal left-[18%] bottom-[22%] w-5 opacity-50",
    style: { animationDelay: "4.1s" },
  },
  {
    src: "/templates/quince-princesa/petal-single.png",
    className: "landing-petal right-[22%] bottom-[18%] w-8 opacity-55",
    style: { animationDelay: "1.2s" },
  },
] as const;

const SPARKS = [
  { top: "16%", left: "22%", delay: "0.2s" },
  { top: "24%", left: "78%", delay: "1.1s" },
  { top: "72%", left: "8%", delay: "2.3s" },
  { top: "78%", left: "88%", delay: "0.7s" },
  { top: "8%", left: "42%", delay: "1.8s" },
  { top: "12%", left: "64%", delay: "3s" },
] as const;

/** Soft petal + sparkle field. CSS pauses itself under prefers-reduced-motion. */
export default function LandingSparkle() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
    >
      {PETALS.map((petal, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`petal-${i}`}
          src={petal.src}
          alt=""
          className={`absolute ${petal.className}`}
          style={petal.style}
        />
      ))}
      {SPARKS.map((spark, i) => (
        <span
          key={`spark-${i}`}
          className="landing-spark absolute h-1.5 w-1.5 rounded-full"
          style={{
            top: spark.top,
            left: spark.left,
            animationDelay: spark.delay,
            background:
              i % 2 === 0
                ? "var(--landing-rose-gold, #C9A27A)"
                : "var(--landing-rose, #B76E79)",
            boxShadow: "0 0 8px rgba(201,162,122,0.55)",
          }}
        />
      ))}
    </div>
  );
}
