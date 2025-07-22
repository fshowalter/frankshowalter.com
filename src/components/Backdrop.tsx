import type { BackdropImageProps } from "~/api/backdrops";

export const BackdropImageConfig = {
  height: 1350,
  sizes: "100vw",
  width: 2400,
};

export function Backdrop({
  deck,
  imageProps,
  title,
  titleClasses,
}: {
  deck: React.ReactNode;
  imageProps: BackdropImageProps;
  title: string;
  titleClasses?: string;
}) {
  const heroImage = (
    <img
      className={`absolute inset-0 size-full object-cover object-top`}
      {...imageProps}
      {...BackdropImageConfig}
      alt=""
      fetchPriority="high"
      loading="eager"
    />
  );

  return (
    <Wrapper heroImage={heroImage}>
      <Title className={titleClasses} value={title} />
      <Deck value={deck} />
    </Wrapper>
  );
}

function Deck({ value }: { value?: React.ReactNode }) {
  return (
    <p
      className={`
        mt-1 text-base
        laptop:text-lg
        desktop:my-4 desktop:text-xl
      `}
    >
      {value}
    </p>
  );
}

function Title({ className, value }: { className?: string; value: string }) {
  return <h1 className={className}>{value}</h1>;
}

function Wrapper({
  children,
  heroImage,
}: {
  children: React.ReactNode;
  heroImage?: React.ReactNode;
}) {
  return (
    <header
      className={`
        relative flex min-h-[clamp(340px,50vh,1350px)] w-full flex-col
        content-start items-center justify-end gap-6 bg-canvas pt-40 pb-8
        tablet:pt-40 tablet:pb-10
        desktop:pb-16
      `}
    >
      {heroImage}
      <div
        className={`
          z-10 mx-auto flex w-full flex-col px-container
          laptop:max-w-(--breakpoint-desktop)
        `}
      >
        {children}
      </div>
    </header>
  );
}
