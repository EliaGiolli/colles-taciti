/**
 * Content collections: where the site's content lives and what shape it has.
 *
 * Astro reads this file before building. Each collection pairs a **loader**
 * (where the entries come from) with a **schema** (what each entry must
 * contain). A wrong entry fails `astro check` and the build, naming the file
 * and the field.
 *
 * - `stories`: one Markdown file per story in `src/core/content/stories/`; the file
 *   name is the slug (`il-limbo-dei-processi.md` → /racconti/il-limbo-dei-processi).
 * - `tags`, `fears`: the controlled vocabularies, one JSON file each. Stories
 *   point to them with `reference()`, so a misspelt slug is caught.
 * - `books`: Elia's reading list, completed from Open Library by `libri:sync`.
 *
 * The content files sit in `src/core/content/`, next to the brand-tone
 * check that guards their public copy: everything about the site's content
 * (the writing, its vocabularies, the rules its copy must follow) is in one
 * folder. Code and Elia's writing are told apart by extension: `.md` and
 * `.json` are content, `.ts` is code.
 *
 * The schemas live in their features (stories, categories, books), so this
 * file only wires them together, like a page.
 *
 * @see https://docs.astro.build/en/guides/content-collections/
 */
import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { bookSchema } from "@/features/books/schema";
import { fearSchema } from "@/features/categories/schema";
import { storySchema, tagSchema } from "@/features/stories/schema";

export const collections = {
  stories: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/core/content/stories" }),
    schema: storySchema,
  }),
  tags: defineCollection({
    loader: file("./src/core/content/tags.json"),
    schema: tagSchema,
  }),
  fears: defineCollection({
    loader: file("./src/core/content/fears.json"),
    schema: fearSchema,
  }),
  books: defineCollection({
    loader: file("./src/core/content/books.json"),
    schema: bookSchema,
  }),
};
