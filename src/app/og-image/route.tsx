import { ImageResponse } from "next/og";

export async function GET(request: Request) {
  const requestedTitle = new URL(request.url).searchParams.get("title");
  const title = requestedTitle?.trim().slice(0, 100) || "Private file tools. Pure speed.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "88px",
          color: "#fafafa",
          background: "#0b0c10",
          border: "1px solid #27272a",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: "-1px",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16,
              color: "#fafafa",
              background: "#18181b",
              border: "1px solid #27272a",
            }}
          >
            Z
          </div>
          Zunvox
        </div>
        <div
          style={{
            marginTop: 54,
            maxWidth: 970,
            display: "flex",
            flexDirection: "column",
            fontSize: 60,
            fontWeight: 750,
            lineHeight: 1.05,
            letterSpacing: "-4px",
          }}
        >
          <div>{title}</div>
        </div>
        <div style={{ marginTop: 28, color: "#a1a1aa", fontSize: 26 }}>
          Free in-browser utilities and on-device AI. Zero uploads.
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
