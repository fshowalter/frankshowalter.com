/**
 * Container component for update entry details.
 * Provides responsive layout and spacing for child elements.
 */
export function UpdateDetails({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="@container/details w-full">
      <div
        className={`
          flex grow flex-col items-start gap-y-2
          tablet:mt-2 tablet:w-full tablet:px-1
        `}
      >
        {children}
      </div>
    </div>
  );
}
