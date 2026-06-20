import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#2B2A27",
        borderRadius: 7,
        color: "#E6E3DC",
        fontSize: 22,
        fontWeight: "bold",
      }}
    >
      +
    </div>,
    { ...size }
  );
}
