import { Grade } from "~/components/grade/Grade";

/**
 * Displays a star rating specifically styled for update entries.
 * Wraps the Grade component with update-specific styling.
 */
export function UpdateGrade({ stars }: { stars: number }): React.JSX.Element {
  return <Grade className="-mt-0.5 pb-[3px]" height={15} value={stars} />;
}
