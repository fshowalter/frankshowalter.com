/**
 * Individual list item wrapper for update entries.
 * Provides hover effects and responsive layout transitions.
 */
export function UpdateListItem({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <li
      className={`
        group/list-item relative mb-1 flex w-full max-w-(--breakpoint-desktop)
        transform-gpu flex-row gap-x-[5%] bg-default px-container py-4
        transition-transform duration-500
        tablet:w-(--update-list-item-width) tablet:flex-col
        tablet:bg-transparent tablet:px-6 tablet:py-6
        tablet:has-[a:hover]:-translate-y-2 tablet:has-[a:hover]:bg-default
        tablet:has-[a:hover]:drop-shadow-2xl
      `}
    >
      {children}
    </li>
  );
}
