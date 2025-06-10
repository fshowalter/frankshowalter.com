import type { JSX } from "react";
export function OpenGraphImage({
  sectionHead = "Frank Showalter",
  title,
}: {
  sectionHead?: string;
  title: string;
}): JSX.Element {
  return (
    <div
      style={{
        backgroundColor: "#f4eedf",
        display: "flex",
        height: "630px",
        position: "relative",
        width: "1200px",
      }}
    >
      <div
        style={{
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          paddingBottom: "64px",
          paddingLeft: "80px",
          paddingRight: "80px",
          paddingTop: "32px",
          position: "absolute",
          width: "1200px",
        }}
      >
        <div
          style={{
            color: "rgb(0 0 0 / 60%)",
            fontFamily: "ArgentumSans",
            marginBottom: "16px",
            textTransform: "uppercase",
          }}
        >
          {sectionHead}
        </div>
        <div
          style={{
            color: "rgb(0 0 0 / 75%)",
            display: "flex",
            flexWrap: "wrap",
            fontFamily: "ArgentumSans",
            fontSize: "88px",
            fontWeight: 600,
            lineHeight: 1,
            textTransform: "uppercase",
            textWrap: "balance",
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}
