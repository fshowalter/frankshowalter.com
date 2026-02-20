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

  describe("movielog entries", () => {
    // Movie cards render as <div> inside <ol>; grab the first <ol> on the page.
    it("renders entries in order with title, year, grade, date, genres, and excerpt", () => {
      const [movielogList] = screen.getAllByRole("list");
      const cards = [...movielogList.children] as HTMLElement[];

      expect(cards).toHaveLength(5);

      // The Untold Story
      expect(within(cards[0]).getByText("The Untold Story")).toBeDefined();
      expect(within(cards[0]).getByText("1993")).toBeDefined();
      expect(within(cards[0]).getByAltText("2 stars (out of 5)")).toBeDefined();
      expect(within(cards[0]).getByText("27 Sept 2025")).toBeDefined();
      expect(within(cards[0]).getByText("Comedy")).toBeDefined();
      expect(within(cards[0]).getByText(", Crime")).toBeDefined();
      expect(within(cards[0]).getByText(", Horror")).toBeDefined();
      expect(within(cards[0]).getByText(", Thriller")).toBeDefined();
      expect(
        within(cards[0]).getByText(
          "Anthony Wong plays a psychotic restaurant owner who falls under police suspicion after a bag of severed limbs washes ashore.",
        ),
      ).toBeDefined();

      // A Field in England
      expect(within(cards[1]).getByText("A Field in England")).toBeDefined();
      expect(within(cards[1]).getByText("2013")).toBeDefined();
      expect(within(cards[1]).getByAltText("4 stars (out of 5)")).toBeDefined();
      expect(within(cards[1]).getByText("25 Sept 2025")).toBeDefined();
      expect(within(cards[1]).getByText("Drama")).toBeDefined();
      expect(within(cards[1]).getByText(", History")).toBeDefined();
      expect(within(cards[1]).getByText(", Horror")).toBeDefined();
      expect(within(cards[1]).getByText(", Mystery")).toBeDefined();
      expect(
        within(cards[1]).getByText(
          "During the English Civil War, a group of deserters encounter a sinister alchemist in a mushroom-laden field.",
        ),
      ).toBeDefined();

      // The Swimmer
      expect(within(cards[2]).getByText("The Swimmer")).toBeDefined();
      expect(within(cards[2]).getByText("1968")).toBeDefined();
      expect(within(cards[2]).getByAltText("5 stars (out of 5)")).toBeDefined();
      expect(within(cards[2]).getByText("25 Sept 2025")).toBeDefined();
      expect(within(cards[2]).getByText("Drama")).toBeDefined();
      expect(
        within(cards[2]).getByText(
          "Burt Lancaster descends into hell via a series of manicured backyard pools.",
        ),
      ).toBeDefined();

      // Stay Hungry
      expect(within(cards[3]).getByText("Stay Hungry")).toBeDefined();
      expect(within(cards[3]).getByText("1976")).toBeDefined();
      expect(within(cards[3]).getByAltText("2.5 stars (out of 5)")).toBeDefined();
      expect(within(cards[3]).getByText("26 Jul 2025")).toBeDefined();
      expect(within(cards[3]).getByText("Comedy")).toBeDefined();
      expect(within(cards[3]).getByText(", Drama")).toBeDefined();
      expect(
        within(cards[3]).getByText(
          "In Birmingham, rich kid Jeff Bridges falls for gym receptionist Sally Field and befriends bodybuilder Arnold Schwarzenegger, much to the dismay of his country-club family and friends.",
        ),
      ).toBeDefined();

      // They're Coming to Get You!
      expect(within(cards[4]).getByText("They're Coming to Get You!")).toBeDefined();
      expect(within(cards[4]).getByText("1972")).toBeDefined();
      expect(within(cards[4]).getByAltText("2 stars (out of 5)")).toBeDefined();
      expect(within(cards[4]).getByText("25 Jul 2025")).toBeDefined();
      expect(within(cards[4]).getByText("Horror")).toBeDefined();
      expect(within(cards[4]).getByText(", Thriller")).toBeDefined();
      expect(
        within(cards[4]).getByText(
          "Haunted by nightmares after losing her unborn child in a car crash, a woman turns to a Satanic cult for relief, only to find she cannot escape their influence.",
        ),
      ).toBeDefined();
    });
  });

  describe("booklog entries", () => {
    // Book cards render as <li> via `as="li"` in BooklogUpdateCard.
    it("renders entries in order with title, authors, year, kind, grade, date, and excerpt", () => {
      const cards = screen.getAllByRole("listitem");

      expect(cards).toHaveLength(4);

      // King Mob
      expect(within(cards[0]).getByText("King Mob")).toBeDefined();
      expect(within(cards[0]).getByText("Philip Fracassi")).toBeDefined();
      expect(within(cards[0]).getByText("2017 | Short Story")).toBeDefined();
      expect(within(cards[0]).getByAltText("3 stars (out of 5)")).toBeDefined();
      expect(within(cards[0]).getByText("12 Jul 2025")).toBeDefined();
      expect(
        within(cards[0]).getByText(
          "In 1780 London, William Blake finds himself swept into the Gordon Riots, only to discover the rioters' enigmatic leader harbors a dark secret.",
        ),
      ).toBeDefined();

      // Shiloh
      expect(within(cards[1]).getByText("Shiloh")).toBeDefined();
      expect(within(cards[1]).getByText("Philip Fracassi")).toBeDefined();
      expect(within(cards[1]).getByText("2017 | Novella")).toBeDefined();
      expect(within(cards[1]).getByAltText("4 stars (out of 5)")).toBeDefined();
      expect(within(cards[1]).getByText("11 Jul 2025")).toBeDefined();
      expect(
        within(cards[1]).getByText(
          "During the brutal Civil War battle, as artillery shreds trees and flesh alike and soldiers become scavengers among the corpses, a Confederate veteran encounters something supernatural stalking the battlefield.",
        ),
      ).toBeDefined();

      // Refugee
      expect(within(cards[2]).getByText("Refugee")).toBeDefined();
      expect(within(cards[2]).getByText("Piers Anthony")).toBeDefined();
      expect(within(cards[2]).getByText("1983 | Novel")).toBeDefined();
      // 0 stars — Grade component renders nothing
      expect(within(cards[2]).getByText("11 Jul 2025")).toBeDefined();
      expect(
        within(cards[2]).getByText(
          "The private papers of Hope Hubris, the Tyrant of Jupiter.",
        ),
      ).toBeDefined();

      // Extreme Ownership
      expect(within(cards[3]).getByText("Extreme Ownership")).toBeDefined();
      expect(within(cards[3]).getByText("Jocko Willink")).toBeDefined();
      expect(within(cards[3]).getByText("Leif Babin")).toBeDefined();
      expect(within(cards[3]).getByText("2015 | Nonfiction")).toBeDefined();
      expect(within(cards[3]).getByAltText("4 stars (out of 5)")).toBeDefined();
      expect(within(cards[3]).getByText("11 Jul 2025")).toBeDefined();
      expect(
        within(cards[3]).getByText(
          "Former Navy SEALs Jocko Willink and Leif Babin distill the principals they honed in the battle of Ramadi and demonstrate their applicability to business.",
        ),
      ).toBeDefined();
    });
  });
});
