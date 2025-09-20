import { Grade } from "~/components/grade/Grade";

export function UpdateGrade({ stars }: { stars: number }): React.JSX.Element {
  return <Grade className="-mt-0.5 pb-[3px]" height={15} value={stars} />;
}
