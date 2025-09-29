import type { BackdropImageProps } from "~/api/backdrops";

/**
 * Image configuration for backdrop images.
 */
export const BackdropImageConfig = {
  height: 1350,
  sizes: "100vw",
  width: 2400,
};

/**
 * Props for the Backdrop component.
 */
type BackdropProps = {
  backdropImageProps?: BackdropImageProps;
  centerText?: boolean;
  deck?: React.ReactNode;
  size?: "default" | "full";
  title: string;
  titleStyle?: string;
};

/**
 * Hero backdrop component with image, title, and optional breadcrumb.
 * @param props - Component props
 * @param props.breadcrumb - Optional breadcrumb link and text
 * @param props.centerText - Whether to center the text content
 * @param props.deck - Optional subtitle or description content
 * @param props.imageProps - Image properties for the backdrop
 * @param props.size - Size variant ("default" or "large")
 * @param props.title - Main title text
 * @param props.titleStyle - Additional CSS classes for the title
 * @returns Backdrop hero section with image and text overlay
 */
export function Backdrop({
  backdropImageProps,
  centerText = false,
  deck,
  size = "default",
  title,
  titleStyle,
}: BackdropProps): React.JSX.Element {
  const heroImage = backdropImageProps ? (
    <img
      className="absolute inset-0 size-full object-cover object-bottom"
      {...backdropImageProps}
      {...BackdropImageConfig}
      alt=""
      fetchPriority="high"
      loading="eager"
    />
  ) : undefined;

  return (
    <Wrapper centerText={centerText} heroImage={heroImage} size={size}>
      <Title className={titleStyle} shadow={Boolean(heroImage)} value={title} />
      <Deck center={centerText} shadow={Boolean(heroImage)} value={deck} />
    </Wrapper>
  );
}

function Deck({
  center,
  shadow = true,
  value,
}: {
  center?: boolean;
  shadow?: boolean;
  value: React.ReactNode;
}): React.JSX.Element {
  return (
    <p
      className={`
        mt-1 font-sans text-base font-normal
        ${
          shadow
            ? `
              text-white/75
              [text-shadow:1px_1px_2px_black]
            `
            : "text-subtle"
        }
        tablet:text-lg
        laptop:my-4 laptop:text-xl
        ${center ? `text-center` : ""}
      `}
    >
      {value}
    </p>
  );
}

function Title({
  className,
  shadow = true,
  value,
}: {
  center?: boolean;
  className?: string;
  shadow?: boolean;
  value: string;
}): React.JSX.Element {
  return (
    <h1
      className={
        className ||
        `
          text-[2rem] leading-10 font-extrabold
          ${shadow ? "[text-shadow:1px_1px_2px_rgba(0,0,0,.25)]" : ""}
          tablet:text-5xl
          laptop:text-7xl
        `
      }
      data-pagefind-weight="10"
    >
      {value}
    </h1>
  );
}

function Wrapper({
  centerText,
  children,
  heroImage,
  size = "default",
}: {
  centerText: boolean;
  children: React.ReactNode;
  heroImage?: React.ReactNode;
  size?: "default" | "full";
}): React.JSX.Element {
  const defaultSizes =
    "min-h-[400px] tablet:min-h-[640px] laptop:min-h-[clamp(640px,70vh,1350px)]";

  const fullSizes = "min-h-[90vh] max-h-[1350px]";

  const sizes = heroImage ? (size === "full" ? fullSizes : defaultSizes) : "";

  return (
    <header
      className={`
        ${sizes}
        relative flex w-full flex-col content-start items-center justify-end
        gap-6
        ${heroImage ? "bg-[#2A2B2A] text-white" : "text-default"}
        pt-40 pb-20
        tablet:pt-40 tablet:pb-20
        laptop:pt-60 laptop:pb-30
      `}
    >
      {heroImage && heroImage}
      <div
        className={`
          ${centerText ? "items-center" : ""}
          z-10 mx-auto flex w-full max-w-(--breakpoint-desktop) flex-col
          px-container
          ${
            heroImage
              ? `
                after:absolute after:top-0 after:left-0 after:-z-10 after:h-full
                after:w-full after:bg-linear-to-t after:from-[rgba(0,0,0,.4)]
                after:via-transparent after:via-10% after:to-100%
              `
              : ""
          }
        `}
      >
        {children}
      </div>
    </header>
  );
}
