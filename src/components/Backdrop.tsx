export function SolidBackdrop({
  deck,
  title,
  titleClasses,
}: {
  deck: React.ReactNode;
  title: string;
  titleClasses?: string;
}) {
  return (
    <Wrapper>
      <Title className={titleClasses} value={title} />
      <Deck value={deck} />
    </Wrapper>
  );
}

function Deck({ value }: { value?: React.ReactNode }) {
  return (
    <p
      className={`
        mt-1 text-lg
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

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <header
      className={`
        relative flex min-h-[clamp(340px,50vh,1350px)] w-full flex-col
        content-start items-center justify-end gap-6 bg-canvas pt-40 pb-8
        tablet:pt-40 tablet:pb-10
        desktop:pt-40 desktop:pb-16
      `}
    >
      <div
        className={`
          z-10 mx-auto flex w-full max-w-[888px] flex-col px-container
          desktop:max-w-(--breakpoint-max)
        `}
      >
        {children}
      </div>
    </header>
  );
}
