<script setup lang="ts">
/**
 * A story in a list. DS: SchedaRacconto (`.ct-scheda`), compact version
 * (no cover thumbnail), for «Se ti è piaciuto» and «Da dove cominciare».
 *
 * A Vue component, although it ships no JavaScript where it is used today:
 * Astro renders a Vue component without a `client:` directive to plain HTML
 * on the server. The search island (PR 6) will render the very same
 * component in the browser, so the card's markup has one source (PLAN ›
 * Schede condivise). Its props are plain data (`StoryCardData`, card.ts),
 * because the island will get them as JSON, not as collection entries.
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
    class="group flex flex-col gap-2 border-t border-linea py-5 no-underline"
  >
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
    <span class="font-mono text-meta text-osso-muto">{{ props.story.meta }}</span>
  </a>
</template>
