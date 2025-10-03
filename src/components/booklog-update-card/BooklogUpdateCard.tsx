import type { CoverImageProps } from "~/api/covers";

import { Grade } from "~/components/grade/Grade";
import { RenderedMarkdown } from "~/components/rendered-markdown/RenderedMarkdown";
import { toSentenceArray } from "~/utils/toSentenceArray";

export type BooklogUpdateCardValue = {
  /** Array of authors for the reviewed work */
  authors: string[];
  /** Cover image properties for display */
  coverImageProps: CoverImageProps;
  /** Review excerpt text */
  excerpt: string;
  /** Grade given to the work */
  gradeValue: number;
  /** Type of work (e.g., "Novel", "Short Story") */
  kind: string;
  reviewDisplayDate: string;
  /** URL slug for the review */
  slug: string;
  /** Title of the reviewed work */
  title: string;
  /** Year the work was published */
  workYear: string;
};

/**
 * Review card component for displaying book review preview with cover and excerpt.
 * Features responsive design with hover effects, styled book cover with lighting,
 * and truncated review content. Used on home page and review listings.
 *
 * @param props - Component props
 * @param props.value - Review data to display in the card
 * @returns Review card component with cover, title, grade, and excerpt
 */
export function BooklogUpdateCard({
  as = "div",
  imageSizes,
  value,
}: {
  as?: React.ElementType;
  imageSizes: string;
  value: BooklogUpdateCardValue;
}): React.JSX.Element {
  const Component = as;

  return (
    <Component
      className={`
        group/list-item @container/card relative row-span-2 grid transform-gpu
        grid-rows-subgrid gap-y-0 bg-default py-6 pr-8 pl-4 transition-transform
        duration-500
        tablet-landscape:has-[a:hover]:-translate-y-2
        tablet-landscape:has-[a:hover]:drop-shadow-2xl
      `}
    >
      <div
        className={`
          row-span-2 grid grid-cols-1 grid-rows-subgrid gap-x-[5%]
          @min-[500px]/card:flex @min-[500px]/card:flex-row
        `}
      >
        <div
          className={`
            relative row-start-1 flex shrink-0 justify-center self-end
            @min-[500px]/card:w-1/4 @min-[500px]/card:self-start
            @min-[500px]/card:drop-shadow-md
          `}
        >
          <div
            className={`
              absolute top-[2.5%] bottom-[2.5%] left-[0] w-full overflow-hidden
              bg-default bg-cover bg-center clip-path-cover
              after:absolute after:size-full after:backdrop-blur-sm
              after:clip-path-cover
              @min-[500px]/card:hidden
            `}
            style={{
              backgroundColor: "var(--background-color-default)",
              backgroundImage: `linear-gradient(90deg, rgba(var(--bg-default-rgb),1) 0%, rgba(var(--bg-default-rgb),var(--bg-default-alpha)) 30%, rgba(var(--bg-default-rgb),0) 50%, rgba(var(--bg-default-rgb),var(--bg-default-alpha)) 70%, rgba(var(--bg-default-rgb),1) 100%), url(${value.coverImageProps.src})`,
            }}
          />
          <div
            className={`
              relative w-1/2 max-w-[200px] shrink-0 self-start overflow-hidden
              rounded-sm shadow-all transition-transform
              after:absolute after:top-0 after:left-0 after:z-10 after:size-full
              after:bg-default after:opacity-15 after:transition-opacity
              group-has-[a:hover]/list-item:after:opacity-0
              @min-[500px]/card:w-full
            `}
          >
            <div
              className={`
                relative
                after:absolute after:top-0 after:left-0 after:z-10 after:block
                after:size-full after:rounded-[2.5px]
                after:bg-[url(/assets/spine-dark.png)] after:bg-size-[100%_100%]
                after:mix-blend-multiply
              `}
            >
              <div
                className={`
                  relative z-10
                  before:absolute before:top-0 before:left-0 before:z-10
                  before:block before:size-full before:rounded-[2.5px]
                  before:bg-[url(/assets/spine-light.png)]
                  before:bg-size-[100%_100%]
                  after:absolute after:top-0 after:left-0 after:block
                  after:size-full after:rounded-[2.5px]
                  after:bg-[url(/assets/spot.png)] after:bg-size-[100%_100%]
                  after:mix-blend-soft-light
                `}
              >
                <img
                  {...value.coverImageProps}
                  alt=""
                  className={`
                    transform-gpu rounded-[2.5px] bg-default
                    transition-transform duration-500
                    group-has-[a:hover]/list-item:scale-110
                  `}
                  decoding="async"
                  loading="lazy"
                  sizes={imageSizes}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`
            row-start-2 mt-4 flex flex-col gap-y-2 px-[8%]
            @min-[500px]/card:mt-0 @min-[500px]/card:px-0
          `}
        >
          {value.reviewDisplayDate && (
            <div
              className={`
                font-sans text-xs leading-4 font-normal tracking-wider
                text-subtle uppercase
                laptop:tracking-wide
              `}
            >
              {value.reviewDisplayDate}
            </div>
          )}
          <a
            className={`
              z-20 font-sans text-xs tracking-wide text-accent uppercase
            `}
            href="https://www.franksbooklog.com/"
          >
            Book Reviews
          </a>
          <a
            className={`
              block text-2xl font-medium transition-colors duration-500
              after:absolute after:top-0 after:left-0 after:z-10 after:size-full
              hover:text-accent hover:before:opacity-0
            `}
            href={`https://www.franksbooklog.com/reviews/${value.slug}/`}
          >
            {value.title}
          </a>
          <div className="-mt-2">
            {toSentenceArray(
              value.authors.map((value) => <span key={value}>{value}</span>),
            )}
          </div>
          <div
            className={`
              font-sans text-sm leading-4 font-normal tracking-prose text-subtle
            `}
          >
            {value.workYear} | {value.kind}
          </div>
          <div>
            <Grade className="mb-2 py-1" height={18} value={value.gradeValue} />
          </div>
          <RenderedMarkdown
            className="tracking-prose text-muted"
            text={value.excerpt}
          />
        </div>
      </div>
    </Component>
  );
}
