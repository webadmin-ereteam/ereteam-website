import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ereteam | Where Data Comes Alive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #0D3A5C 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        {/* Tag line */}
        <div
          style={{
            color: "#1A6FA8",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Enterprise Data & Analytics
        </div>

        {/* Main title */}
        <div
          style={{
            color: "#ffffff",
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          Where Data
          <br />
          Comes Alive
        </div>

        {/* Description */}
        <div
          style={{
            color: "#94a3b8",
            fontSize: 24,
            maxWidth: 700,
            lineHeight: 1.5,
            marginBottom: 48,
          }}
        >
          25 years of expertise in Data, Cloud & AI — Financial Performance Intelligence — Marketing Intelligence
        </div>

        {/* Domain */}
        <div
          style={{
            color: "#1A6FA8",
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          ereteam.com
        </div>
      </div>
    ),
    { ...size }
  );
}
