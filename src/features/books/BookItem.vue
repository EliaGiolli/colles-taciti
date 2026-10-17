<script setup lang="ts">
/**
 * A book in the list of /libri. DS: Libro con copertina
 * (`ct-libro--con-cop`): a 64px cover in 2:3 on the left, then the title
 * in italic, author and year in mono, and the personal note when there is
 * one.
 *
 * Like `StoryCard.vue`, a Vue component rendered in two places with one
 * source of markup: on the server by the /libri page (plain HTML, no
 * JavaScript) and in the browser by the search island once it hydrates.
 * Its props are plain data (`BookCardData`, card.ts).
 *
 * **The cover** is in black and white and turns to colour when the
 * pointer is over the book or the link has the keyboard focus (DS: CSS
 * `filter`, 300ms). It is a decorative copy of what the text already says,
 * so it has an empty `alt` and the box is hidden from screen readers.
 * Without a cover from Open Library, the DS typographic stand-in
 * (`ct-libro-cop--ripiego`): the title in Bodoni and the author's surname.
 * Covers are `loading="lazy"`: the list is long and most of it is below
 * the fold.
 *
 * **The link**, when the book has been matched on Open Library, makes the
 * whole item point to the work's page there, in the same tab (DS: external
 * links do not open new tabs). That page is also the credit for the data.
 * No affiliate links and no ratings (DS › Libro: «non è una vetrina»).
 */
import { cn } from "@/shared/lib/cn";
import type { BookCardData } from "./card";
import { booksCopy } from "./copy";

const props = defineProps<{
  book: BookCardData;
}>();
</script>

<template>
  <component
    :is="props.book.href ? 'a' : 'div'"
    :href="props.book.href"
    class="group grid grid-cols-[64px_1fr] items-start gap-4 border-t border-linea py-4 no-underline"
  >
    <div
      aria-hidden="true"
      :class="
        cn(
          'aspect-[2/3] overflow-hidden border border-linea bg-terra-alta',
          !props.book.cover && 'flex flex-col justify-between p-2',
        )
      "
    >
      <img
        v-if="props.book.cover"
        :src="props.book.cover"
        alt=""
        width="128"
        height="192"
        loading="lazy"
        decoding="async"
        class="block size-full object-cover contrast-105 grayscale transition-[filter] duration-300 group-hover:filter-none group-focus-visible:filter-none"
      />
      <template v-else>
        <b class="font-display text-[0.9375rem]/[1.1] font-medium text-osso">{{
          props.book.title
        }}</b>
        <span class="font-mono text-[0.8125rem]/[1rem] text-osso-muto">{{
          props.book.shortAuthor
        }}</span>
      </template>
    </div>
    <div class="flex flex-col">
      <p
        :class="
          cn(
            'text-lettura text-osso italic',
            props.book.href && 'transition-colors group-hover:text-ferita',
          )
        "
      >
        {{ props.book.title }}
      </p>
      <span class="font-mono text-meta text-osso-muto">{{ props.book.byline }}</span>
      <p v-if="props.book.note" class="mt-2 text-corpo">
        <span class="font-mono text-meta text-ruggine-testo">{{
          booksCopy.notePrefix[props.book.section]
        }}</span
        >&nbsp;{{ props.book.note }}
      </p>
    </div>
  </component>
</template>
