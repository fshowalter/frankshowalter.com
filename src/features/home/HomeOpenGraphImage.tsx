export type OpenGraphImageComponentType = (
  props: OpenGraphImageProps,
) => React.JSX.Element;

type OpenGraphImageProps = {
  backdrop: string;
};

export function HomeOpenGraphImage({
  backdrop,
}: {
  backdrop?: string;
}): React.JSX.Element {
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
            color: "#fff",
            display: "flex",
            fontFamily: "FrankRuhlLibre",
            fontSize: "72px",
            fontWeight: 800,
            lineHeight: 1,
            marginTop: "auto",
            textShadow: "1px 1px 2px black",
          }}
        >
          Frank Showalter
        </div>
        <div
          style={{
            color: "#c29d52",
            fontFamily: "Assistant",
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "8px",
            textShadow: "1px 1px 2px black",
          }}
        >
          Mostly movie reviews, sometimes book reviews.
        </div>
      </div>
    </div>
  );
}
