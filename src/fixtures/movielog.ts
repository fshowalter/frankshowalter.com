import type { MovielogData } from "~/content.config";

export const movielogFixtures: MovielogData[] = [
  {
    date: new Date("2025-09-27T00:00:00.000Z"),
    excerpt:
      "<p>Anthony Wong plays a psychotic restaurant owner who falls under police suspicion after a bag of severed limbs washes ashore.</p>",
    genres: ["Comedy", "Crime", "Horror", "Thriller"],
    slug: "the-untold-story-1993",
    stars: 2,
    title: "The Untold Story",
    year: "1993",
  },
  {
    date: new Date("2025-09-25T00:00:00.000Z"),
    excerpt:
      "<p>During the English Civil War, a group of deserters encounter a sinister alchemist in a mushroom-laden field.</p>",
    genres: ["Drama", "History", "Horror", "Mystery"],
    slug: "a-field-in-england-2013",
    stars: 4,
    title: "A Field in England",
    year: "2013",
  },
  {
    date: new Date("2025-09-25T00:00:00.000Z"),
    excerpt:
      "<p>Burt Lancaster descends into hell via a series of manicured backyard pools.</p>",
    genres: ["Drama"],
    slug: "the-swimmer-1968",
    stars: 5,
    title: "The Swimmer",
    year: "1968",
  },
  {
    date: new Date("2025-07-26T00:00:00.000Z"),
    excerpt:
      "<p>In Birmingham, rich kid Jeff Bridges falls for gym receptionist Sally Field and befriends bodybuilder Arnold Schwarzenegger, much to the dismay of his country-club family and friends.</p>",
    genres: ["Comedy", "Drama"],
    slug: "stay-hungry-1976",
    stars: 2.5,
    title: "Stay Hungry",
    year: "1976",
  },
  {
    date: new Date("2025-07-25T00:00:00.000Z"),
    excerpt:
      "<p>Haunted by nightmares after losing her unborn child in a car crash, a woman turns to a Satanic cult for relief, only to find she cannot escape their influence.</p>",
    genres: ["Horror", "Thriller"],
    slug: "theyre-coming-to-get-you-1972",
    stars: 2,
    title: "They're Coming to Get You!",
    year: "1972",
  },
];
