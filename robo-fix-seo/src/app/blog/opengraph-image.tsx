// app/blog/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 64,
          background: "#0b0b0b",
          color: "#fff",
          fontSize: 64,
          fontWeight: 800,
        }}
      >
        Robonarim Blog
      </div>
    ),
    size
  );
}
