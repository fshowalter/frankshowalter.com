/**
 * Site logo component with title and author.
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @returns Logo element with site title and author byline
 */
export function Logo({ className }: { className?: string }): React.JSX.Element {
  return (
    <div
      className={`
        flex transform-gpu flex-col transition-transform duration-500
        has-[a:hover]:scale-105
        ${className ?? ""}
      `}
    >
      <div
        className={`
          text-[1.375rem] leading-8 font-normal whitespace-nowrap
          tablet:text-[1.5625rem]
        `}
      >
        <a href="/">Frank Showalter</a>
      </div>
      <p className={"w-full pl-px text-sm leading-4 italic opacity-85"}>
        “I thought you&apos;d be taller”
      </p>
    </div>
  );
}
