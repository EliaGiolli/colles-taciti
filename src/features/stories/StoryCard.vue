<script setup lang="ts">
/**
 * A story in a list. DS: SchedaRacconto (`.ct-scheda`), in two versions:
 * - **compact** (no cover), for «Se ti è piaciuto» and «Da dove cominciare»;
 * - **with cover** (`ct-scheda--copertina`), for «Ultimi racconti» and the
 *   archive: the Wattpad-format cover, 96px wide, left of the text.
 *
 * A Vue component, although it ships no JavaScript where it is used today:
 * Astro renders a Vue component without a `client:` directive to plain HTML
 * on the server. The search island (PR 6) will render the very same
 * component in the browser, so the card's markup has one source (PLAN ›
 * Schede condivise). Its props are plain data (`StoryCardData`, card.ts),
 * because the island will get them as JSON, not as collection entries.
 *
 * The cover arrives as an SVG string (`coverSvg()` in features/covers) and
 * is inserted with `v-html`. That is safe only because every piece of text
 * in it has been escaped by `escapeXml()`; never pass markup built from
 * unescaped input here. Its accessible name is short («Copertina di …»):
 * the real title is the heading right next to it (DS › SchedaRacconto).
 *
 * The whole card is one link, as in the DS: label, title, the logline and
 * the metadata line. The title's colour turns ferita on hover. Cards are
 * separated by a linea rule on top, never by boxes or coloured borders.
 */
import { labelVariants } from "@/shared/variants/label";
import type { StoryCardData } from "./card";
import { storiesCopy } from "./copy";

const props = withDefaults(
  defineProps<{
    story: StoryCardData;
    /** Heading level of the title: 3 under a section H2 (default), 2 at the top of a list page. */
    headingLevel?: 2 | 3;
  }>(),
  { headingLevel: 3 },
);
</script>

<template>
  <a
    :href="props.story.href"
    class="group border-t border-linea py-5 no-underline"
    :class="props.story.cover ? 'grid grid-cols-[96px_1fr] items-start gap-4' : 'flex flex-col'"
  >
    <div v-if="props.story.cover" class="w-[96px]" v-html="props.story.cover" />
    <div class="flex flex-col gap-2">
      <span :class="labelVariants()">
        {{ props.story.label
        }}<template v-if="props.story.ongoing">
          · <span class="text-ferita">{{ storiesCopy.ongoing }}</span></template
        >
      </span>
      <component
        :is="`h${props.headingLevel}`"
        class="font-display text-titolo-2 text-osso transition-colors group-hover:text-ferita"
      >
        {{ props.story.title }}
      </component>
      <p class="text-presentazione text-osso-muto italic">{{ props.story.logline }}</p>
      <span v-if="props.story.meta" class="font-mono text-meta text-osso-muto">{{
        props.story.meta
      }}</span>
    </div>
  </a>
</template>
