/**
 * Type definition for Open Graph image components.
 */
export type OpenGraphImageComponentType = () => React.JSX.Element;

/**
 * Generates the Open Graph image for the home page.
 * Creates a 1200x630 image with site title, and tagline.
 */
export function HomeOpenGraphImage(): React.JSX.Element {
  "use no memo";

  return (
    <div
      style={{
        backgroundColor: "#f4f1ea",
        display: "flex",
        height: "630px",
        position: "relative",
        width: "1200px",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          data-testid="title"
          style={{
            color: "#252525",
            display: "flex",
            fontFamily: "FrankRuhlLibre",
            fontSize: "72px",
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          Frank Showalter
        </div>
        <div
          data-testid="tagline"
          style={{
            color: "rgb(0,0,0,.6)",
            display: "flex",
            fontFamily: "Assistant",
            fontSize: "20px",
            fontWeight: 600,
            lineHeight: "1.25",
            marginTop: "8px",
          }}
        >
          Mostly&nbsp;
          <span style={{ color: "#bf8a00" }}>movie reviews</span>
          ,&nbsp;sometimes&nbsp;
          <span style={{ color: "#bf8a00" }}>book reviews</span>.
        </div>
      </div>
    </div>
  );
}
