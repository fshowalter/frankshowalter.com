/**
 * Displays a formatted date string for update entries.
 * Styled with subtle text color and consistent typography.
 */
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
