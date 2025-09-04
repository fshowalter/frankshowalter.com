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
}: {
  deck: React.ReactNode;
  imageProps: BackdropImageProps;
  title: string;
}) {
  const heroImage = (
    <img
      className={`absolute inset-0 size-full object-cover object-bottom`}
      {...imageProps}
      {...BackdropImageConfig}
      alt=""
      fetchPriority="high"
      loading="eager"
    />
  );

  return (
    <Wrapper heroImage={heroImage}>
      <Title value={title} />
      <Deck value={deck} />
    </Wrapper>
  );
}

function Deck({ value }: { value?: React.ReactNode }) {
  return (
    <p
      className={`
        mt-1 font-sans text-base text-off-white
        [text-shadow:1px_1px_2px_black]
        laptop:my-4 laptop:text-xl
      `}
    >
      {value}
    </p>
  );
}

function Title({ value }: { className?: string; value: string }) {
  return (
    <h1
      className={`
        text-[2rem] leading-10 font-extrabold
        [text-shadow:1px_1px_2px_#252525]
        tablet:text-4xl
        laptop:text-7xl
      `}
    >
      {value}
    </h1>
  );
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
        relative flex min-h-[400px] w-full flex-col content-start items-center
        justify-end gap-6 border-b-2 border-hero-bg bg-hero-bg pt-40 pb-8
        text-white
        tablet:min-h-[640px] tablet:pt-40 tablet:pb-10
        laptop:min-h-[clamp(640px,70vh,1350px)] laptop:pt-40 laptop:pb-16
        desktop:pb-16
      `}
    >
      {heroImage}
      <div
        className={`
          z-10 mx-auto flex w-full max-w-[908px] flex-col px-container
          after:absolute after:top-0 after:left-0 after:-z-10 after:h-full
          after:w-full after:bg-linear-to-t after:from-[rgba(0,0,0,.4)]
          after:via-transparent after:via-10% after:to-100%
          laptop:max-w-(--breakpoint-desktop)
        `}
      >
        {children}
      </div>
    </header>
  );
}
