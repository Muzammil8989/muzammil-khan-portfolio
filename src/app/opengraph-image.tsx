import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ProfileService } from "@/services/profile-service";
import { DATA } from "@/data/resume";

export const alt = "Portfolio - Full Stack Web Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Fetch profile from DB
  let name = DATA.name;
  let description = "Full Stack Web Developer";
  let profileImageSrc: string | null = null;

  try {
    const profiles = await ProfileService.getAll();
    const profile = profiles[0] as any;
    if (profile) {
      if (profile.name) name = profile.name;
      if (profile.description) description = profile.description;

      // Use Cloudinary avatar if available, else fall back to local file
      if (profile.avatarUrl) {
        const res = await fetch(profile.avatarUrl);
        const buf = await res.arrayBuffer();
        const ext = profile.avatarUrl.includes(".png") ? "png" : "jpeg";
        profileImageSrc = `data:image/${ext};base64,${Buffer.from(buf).toString("base64")}`;
      }
    }
  } catch {
    // silently fall back
  }

  // Fall back to local file if no avatar from DB
  if (!profileImageSrc) {
    try {
      const buf = await readFile(join(process.cwd(), "public", "profile-image.png"));
      profileImageSrc = `data:image/png;base64,${buf.toString("base64")}`;
    } catch {
      // no image at all
    }
  }

  const siteHost = DATA.url.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #000045 0%, #0a0a2e 50%, #1a1a4e 100%)",
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
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(99, 102, 241, 0.15)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(139, 92, 246, 0.12)", display: "flex" }} />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {/* Profile Image */}
          {profileImageSrc && (
            <img
              src={profileImageSrc}
              alt=""
              width={100}
              height={100}
              style={{ borderRadius: "50%", border: "3px solid rgba(129, 140, 248, 0.5)" }}
            />
          )}

          <div style={{ fontSize: 24, color: "#818cf8", letterSpacing: 4, textTransform: "uppercase", fontWeight: 600, display: "flex", marginTop: 8 }}>
            Portfolio
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, color: "white", lineHeight: 1.1, textAlign: "center", display: "flex" }}>
            {name}
          </div>
          <div style={{ fontSize: 26, color: "#a5b4fc", marginTop: 4, display: "flex", textAlign: "center", maxWidth: 800 }}>
            {description}
          </div>
        </div>

        {/* Bottom URL */}
        <div style={{ position: "absolute", bottom: 32, fontSize: 16, color: "rgba(165, 180, 252, 0.6)", display: "flex" }}>
          {siteHost}
        </div>
      </div>
    ),
    { ...size }
  );
}
