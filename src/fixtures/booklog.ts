import type { BooklogData } from "~/content.config";

export const booklogFixtures: BooklogData[] = [
  {
    authors: ["Philip Fracassi"],
    date: new Date("2025-07-12T00:00:00.000Z"),
    excerpt:
      "<p>In 1780 London, William Blake finds himself swept into the Gordon Riots, only to discover the rioters' enigmatic leader harbors a dark secret.</p>",
    kind: "Short Story",
    slug: "king-mob-by-philip-fracassi",
    stars: 3,
    title: "King Mob",
    workYear: "2017",
  },
  {
    authors: ["Philip Fracassi"],
    date: new Date("2025-07-11T00:00:00.000Z"),
    excerpt:
      "<p>During the brutal Civil War battle, as artillery shreds trees and flesh alike and soldiers become scavengers among the corpses, a Confederate veteran encounters something supernatural stalking the battlefield.</p>",
    kind: "Novella",
    slug: "shiloh-by-philip-fracassi",
    stars: 4,
    title: "Shiloh",
    workYear: "2017",
  },
  {
    authors: ["Piers Anthony"],
    date: new Date("2025-07-11T00:00:00.000Z"),
    excerpt: "<p>The private papers of Hope Hubris, the Tyrant of Jupiter.</p>",
    kind: "Novel",
    slug: "refugee-by-piers-anthony",
    stars: 0,
    title: "Refugee",
    workYear: "1983",
  },
  {
    authors: ["Jocko Willink", "Leif Babin"],
    date: new Date("2025-07-11T00:00:00.000Z"),
    excerpt:
      "<p>Former Navy SEALs Jocko Willink and Leif Babin distill the principals they honed in the battle of Ramadi and demonstrate their applicability to business.</p>",
    kind: "Nonfiction",
    slug: "extreme-ownership-by-jocko-willink-leif-babin",
    stars: 4,
    title: "Extreme Ownership",
    workYear: "2015",
  },
];
