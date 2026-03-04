import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Muhammad Muzammil Khan - Full Stack Web Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const imageBuffer = await readFile(
    join(process.cwd(), "public", "profile-image.png")
  );
  const base64 = imageBuffer.toString("base64");
  const profileImageSrc = `data:image/png;base64,${base64}`;

  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #000045 0%, #0a0a2e 50%, #1a1a4e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(99, 102, 241, 0.15)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(139, 92, 246, 0.12)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Profile Image */}
          <img
            src={profileImageSrc}
            alt=""
            width={100}
            height={100}
            style={{
              borderRadius: "50%",
              border: "3px solid rgba(129, 140, 248, 0.5)",
            }}
          />

          <div
            style={{
              fontSize: 24,
              color: "#818cf8",
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 600,
              display: "flex",
              marginTop: 8,
            }}
          >
            Portfolio
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
              textAlign: "center",
              display: "flex",
            }}
          >
            Muhammad Muzammil Khan
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#a5b4fc",
              marginTop: 4,
              display: "flex",
            }}
          >
            Full Stack Web Developer
          </div>

          {/* Tech badges */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 20,
            }}
          >
            {["React", "Next.js", "TypeScript", "Node.js", "MongoDB"].map(
              (tech) => (
                <div
                  key={tech}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 24,
                    border: "1px solid rgba(165, 180, 252, 0.3)",
                    color: "#c7d2fe",
                    fontSize: 16,
                    display: "flex",
                  }}
                >
                  {tech}
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 16,
            color: "rgba(165, 180, 252, 0.6)",
            display: "flex",
          }}
        >
          muhammad-muzammil-khan.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
