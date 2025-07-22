import type { JSX } from "react";
export function OpenGraphImage({
  backdrop,
  sectionHead = "Frank Showalter",
  title,
}: {
  backdrop?: string;
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
      <img
        height={630}
        src={backdrop}
        style={{
          objectFit: "cover",
        }}
        width={1200}
      />
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
            color: "#fff",
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
