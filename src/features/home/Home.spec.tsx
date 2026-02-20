import { render, screen, within } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { booklogFixtures } from "~/fixtures/booklog";
import { movielogFixtures } from "~/fixtures/movielog";

import type { HomeProps } from "./Home";

import { getHomeProps } from "./getHomeProps";
import { Home } from "./Home";

describe("Home", () => {
  let homeProps: HomeProps;

  beforeAll(async () => {
    homeProps = await getHomeProps(booklogFixtures, movielogFixtures);
  });

  beforeEach(() => {
    render(<Home {...homeProps} />);
  });

  describe("movielog updates", () => {
    // Movie cards render as <li> inside <ol data-testid="movielog-updates">.
    it.for([
      {
        date: "27 Sept 2025",
        genres: "Comedy, Crime, Horror, Thriller",
        order: 1,
        rating: "2 stars (out of 5)",
        synopsis:
          "Anthony Wong plays a psychotic restaurant owner who falls under police suspicion after a bag of severed limbs washes ashore.",
        title: "The Untold Story",
        year: "1993",
      },
      {
        date: "25 Sept 2025",
        genres: "Drama, History, Horror, Mystery",
        order: 2,
        rating: "4 stars (out of 5)",
        synopsis:
          "During the English Civil War, a group of deserters encounter a sinister alchemist in a mushroom-laden field.",
        title: "A Field in England",
        year: "2013",
      },
      {
        date: "25 Sept 2025",
        genres: "Drama",
        order: 3,
        rating: "5 stars (out of 5)",
        synopsis:
          "Burt Lancaster descends into hell via a series of manicured backyard pools.",
        title: "The Swimmer",
        year: "1968",
      },
      {
        date: "26 Jul 2025",
        genres: "Comedy, Drama",
        order: 4,
        rating: "2.5 stars (out of 5)",
        synopsis:
          "In Birmingham, rich kid Jeff Bridges falls for gym receptionist Sally Field and befriends bodybuilder Arnold Schwarzenegger, much to the dismay of his country-club family and friends.",
        title: "Stay Hungry",
        year: "1976",
      },
      {
        date: "25 Jul 2025",
        genres: "Horror, Thriller",
        order: 5,
        rating: "2 stars (out of 5)",
        synopsis:
          "Haunted by nightmares after losing her unborn child in a car crash, a woman turns to a Satanic cult for relief, only to find she cannot escape their influence.",
        title: "They're Coming to Get You!",
        year: "1972",
      },
    ])(
      `renders data for card $order: $title`,
      ({ date, genres, order, rating, synopsis, title, year }) => {
        const movielogList =
          screen.getByTestId<HTMLOListElement>("movielog-updates");
        const cards = [...movielogList.children] as HTMLLIElement[];

        expect(within(cards[order - 1]).getByText(title)).toBeDefined();
        expect(within(cards[order - 1]).getByText(year)).toBeDefined();
        expect(within(cards[order - 1]).getByAltText(rating)).toBeDefined();
        expect(within(cards[order - 1]).getByText(date)).toBeDefined();
        expect(within(cards[order - 1]).getByText(genres)).toBeDefined();
        expect(within(cards[order - 1]).getByText(synopsis)).toBeDefined();
      },
    );
  });

  describe("booklog updates", () => {
    // Book cards render as <li> via `as="li"` inside <ol data-testid="booklog-updates">.
    it.for([
      {
        authors: "Philip Fracassi",
        date: "12 Jul 2025",
        order: 1,
        rating: "3 stars (out of 5)",
        synopsis:
          "In 1780 London, William Blake finds himself swept into the Gordon Riots, only to discover the rioters' enigmatic leader harbors a dark secret.",
        title: "King Mob",
        yearKind: "2017 | Short Story",
      },
      {
        authors: "Philip Fracassi",
        date: "11 Jul 2025",
        order: 2,
        rating: "4 stars (out of 5)",
        synopsis:
          "During the brutal Civil War battle, as artillery shreds trees and flesh alike and soldiers become scavengers among the corpses, a Confederate veteran encounters something supernatural stalking the battlefield.",
        title: "Shiloh",
        yearKind: "2017 | Novella",
      },
      {
        authors: "Piers Anthony",
        date: "11 Jul 2025",
        order: 3,
        rating: "Abandoned",
        synopsis: "The private papers of Hope Hubris, the Tyrant of Jupiter.",
        title: "Refugee",
        yearKind: "1983 | Novel",
      },
      {
        authors: "Jocko Willink and Leif Babin",
        date: "11 Jul 2025",
        order: 4,
        rating: "4 stars (out of 5)",
        synopsis:
          "Former Navy SEALs Jocko Willink and Leif Babin distill the principals they honed in the battle of Ramadi and demonstrate their applicability to business.",
        title: "Extreme Ownership",
        yearKind: "2015 | Nonfiction",
      },
    ])(
      `renders data for card $order: $title`,
      ({ authors, date, order, rating, synopsis, title, yearKind }) => {
        const booklogList =
          screen.getByTestId<HTMLOListElement>("booklog-updates");
        const cards = [...booklogList.children] as HTMLLIElement[];

        expect.assertions(6);
        expect(within(cards[order - 1]).getByText(title)).toBeDefined();
        expect(within(cards[order - 1]).getByText(authors)).toBeDefined();
        expect(within(cards[order - 1]).getByText(yearKind)).toBeDefined();
        if (rating === "Abandoned") {
          expect(within(cards[order - 1]).getByText(rating)).toBeDefined();
        } else {
          expect(within(cards[order - 1]).getByAltText(rating)).toBeDefined();
        }
        expect(within(cards[order - 1]).getByText(date)).toBeDefined();
        expect(within(cards[order - 1]).getByText(synopsis)).toBeDefined();
      },
    );
  });
});
