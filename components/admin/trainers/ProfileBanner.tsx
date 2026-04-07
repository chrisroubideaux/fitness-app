// componnets/admin/trainers/ProfileBanner.tsx
"use client";

import { useEffect, useState } from "react";

type Props = {
  name: string;
  bannerUrl?: string | null;
  eyebrow?: string;
  description?: string;
};

export default function ProfileBanner({
  name,
  bannerUrl,
  eyebrow = "Meet Your Trainer",
  description = "Explore this trainer’s background, specialties, and coaching approach to find the support that fits your goals best.",
}: Props) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 992);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      style={{
        width: "100%",
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          background: bannerUrl
            ? `url(${bannerUrl}) center center / cover no-repeat`
            : "linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(15,23,42,0.18), rgba(15,23,42,0.68))",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            padding: isDesktop ? "0 3.5rem 0 7.25rem" : "0 1.25rem",
          }}
        >
          <div
            style={{
              maxWidth: "720px",
              color: "#fff",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.45rem 0.85rem",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              {eyebrow}
            </span>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
                lineHeight: 0.96,
                fontWeight: 800,
                letterSpacing: "-0.04em",
              }}
            >
              {name}
            </h1>

            <p
              style={{
                marginTop: "1.25rem",
                marginBottom: 0,
                maxWidth: "620px",
                fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.88)",
              }}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}