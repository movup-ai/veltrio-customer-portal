import { ImageResponse } from "next/og";
import { siteConfig } from "@/shared/config/site";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social-share image. Colors are literal because CSS variables are not available here. */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#0a0b0d",
        color: "#ffffff",
      }}
    >
      <div style={{ display: "flex", fontSize: 40, color: "#f2542d" }}>
        veltrio
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 88, lineHeight: 1, letterSpacing: -2 }}>
          Drive something remarkable.
        </div>
        <div style={{ fontSize: 32, color: "#c9c6bf" }}>
          Rent from independent car rental companies.
        </div>
      </div>
    </div>,
    size,
  );
}
