export function UpdateDate({
  displayDate,
}: {
  displayDate: string;
}): React.JSX.Element {
  return (
    <div
      className={`
        font-sans text-[13px] leading-4 font-normal whitespace-nowrap
        text-subtle
        tablet:tracking-wide
      `}
    >
      {displayDate}
    </div>
  );
}
