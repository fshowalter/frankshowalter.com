export function HomeUpdateList({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="@container/update-list">
      <ol
        className={`
          items-baseline
          [--update-list-item-width:50%]
          tablet:-mx-6 tablet:flex tablet:flex-wrap
          @min-[calc((250px_*_2)_+_1px)]/update-list:[--update-list-item-width:33.33%]
          @min-[calc((250px_*_5)_+_1px)]/update-list:[--update-list-item-width:16.66%]
        `}
      >
        {children}
      </ol>
    </div>
  );
}
