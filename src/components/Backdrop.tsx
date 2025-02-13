export function SolidBackdrop({
  deck,
  title,
  titleStyle,
}: {
  deck: React.ReactNode;
  title: string;
  titleStyle?: string;
}) {
  return (
    <Wrapper>
      <Title className={titleStyle} value={title} />
      <Deck value={deck} />
    </Wrapper>
  );
}

function Deck({ value }: { value?: React.ReactNode }) {
  return <p className={`desktop:my-4 desktop:text-xl mt-1 text-lg`}>{value}</p>;
}

function Title({ className, value }: { className?: string; value: string }) {
  return <h1 className={className}>{value}</h1>;
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <header
      className={`bg-canvas tablet:pb-10 tablet:pt-40 desktop:pb-16 desktop:pt-40 relative flex min-h-[clamp(340px,50vh,1350px)] w-full flex-col content-start items-center justify-end gap-6 pt-40 pb-8`}
    >
      <div
        className={`px-container desktop:max-w-(--breakpoint-max) z-10 mx-auto flex w-full max-w-[888px] flex-col`}
      >
        {children}
      </div>
    </header>
  );
}
