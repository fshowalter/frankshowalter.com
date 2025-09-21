import { UpdateListItem } from "./UpdateListItem";

/**
 * Generic list component for displaying update entries.
 * Provides responsive grid layout with automatic column adjustment based on container width.
 */
export function UpdateList<T extends { slug: string }>({
  children,
  values,
}: {
  children: (value: T) => React.ReactNode;
  values: T[];
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
        {[...values].map((value) => (
          <UpdateListItem key={value.slug}>{children(value)}</UpdateListItem>
        ))}
      </ol>
    </div>
  );
}
