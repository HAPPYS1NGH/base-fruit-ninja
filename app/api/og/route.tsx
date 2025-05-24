import React from "react";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  console.log(searchParams);
  const score = searchParams.get("score") || "100";
  const pfp = searchParams.get("pfp") || "https://i.imgur.com/7ffGYrq.jpg";

  // Load font and images
  // Load Inter font
  // async function loadGoogleFont(font: string, text: string) {
  //   const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
  //   const css = await (await fetch(url)).text();
  //   const resource = css.match(
  //     /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  //   );

  //   if (resource) {
  //     const response = await fetch(resource[1]);
  //     if (response.status == 200) {
  //       return await response.arrayBuffer();
  //     }
  //   }

  //   throw new Error("failed to load font data");
  // }
  // Load Goten font from local file
  const gotenFont = await fetch(
    new URL("../../../fonts/Gotens/gotens-regular.otf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  const boardOgUrl = `${process.env.NEXT_PUBLIC_URL || ""}/board-og.png`;
  const logoUrl = `${process.env.NEXT_PUBLIC_URL || ""}/white-logo.png`;
  const text = "Score: " + score;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundImage: `url(${boardOgUrl})`,
          backgroundSize: "cover",
        }}
      >
        {/* Ninja logo */}
        <img
          src={logoUrl}
          width={140}
          height={140}
          style={{ margin: "40px 0 0 0", display: "block" }}
        />
        {/* Score card */}
        <div
          style={{
            marginTop: 40,
            background: "white",
            borderRadius: 60,
            display: "flex",
            alignItems: "center",
            padding: "0 60px 0 20px",
            minWidth: 500,
            minHeight: 110,
            boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
            fontFamily: "Gotens",
          }}
        >
          <img
            src={pfp}
            width={100}
            height={100}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: "6px solid white",
              marginRight: 24,
            }}
          />
          <span
            style={{
              fontFamily: "Gotens",
              fontSize: 60,
              color: "#4B2E13",
              fontWeight: 900,
              letterSpacing: 2,
              marginRight: 18,
            }}
          >
            {text}
          </span>
          {/* Chevron */}
          <span style={{ fontSize: 60, color: "#4B2E13", fontWeight: 900 }}>
            {"»"}
          </span>
        </div>
        {/* Take Revenge button */}
        <div
          style={{
            marginTop: 60,
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontFamily: "Gotens",
            fontSize: 56,
            color: "white",
            fontWeight: 900,
            textShadow: "0 2px 8px #0008",
          }}
        ></div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Gotens",
          data: gotenFont,
        },
      ],
    },
  );
}
