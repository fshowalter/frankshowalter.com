import { recentBookReviews } from "~/api/bookReviews";
import type { Props } from "./Home";
import { getFluidCoverImageProps } from "~/api/covers";
import { CoverImageConfig } from "./BookReviewListItem";

export async function getProps(): Promise<Props> {
  const bookReviews = await recentBookReviews();

  return {
    bookReviews: await Promise.all(
      bookReviews.map(async (review) => {
        return {
          ...review,
          coverImageProps: await getFluidCoverImageProps(
            review.slug,
            CoverImageConfig
          ),
        };
      })
    ),
  };
}
