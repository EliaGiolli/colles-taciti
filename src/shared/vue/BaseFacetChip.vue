<script setup lang="ts">
/**
 * A filter value that can be switched on and off: `<button aria-pressed>`.
 * DS: no dedicated component, built from Pulsante (see
 * `shared/variants/chip.ts`); the PLAN calls it FacetChip.
 *
 * A toggle button, not a checkbox, because the chips sit in a wrapping row
 * like words rather than in a form: `aria-pressed` gives screen readers the
 * same on/off state a checkbox would («Mugello, pulsante di attivazione,
 * premuto»), and the group around the chips carries the facet's name.
 *
 * The count is drawn as a bare number («Mugello 2»), which means nothing
 * when heard. So when there is a count, the button gets an explicit
 * accessible name with the count in words, `countLabel`: «Mugello 2
 * racconti». It begins with exactly what is drawn, «Mugello 2», as WCAG
 * asks («label in name», 2.5.3): someone using voice control says what
 * they see. The phrase is a prop because this shared component cannot know
 * what is being counted (stories here, books on /libri).
 *
 * Why `aria-label` and not a visually hidden span next to the number:
 * a name assembled from several child elements depends on how each tool
 * joins them. Chrome puts a space between the flex items of the button,
 * Testing Library's jsdom trims it away, and the spaces of the caller's
 * template leak in («Mugello , 2»). One attribute reads the same
 * everywhere. For the same reason the label is a prop, not a slot.
 *
 * Extra attributes and listeners (`@click`) go to the `<button>` (Vue's
 * default attribute inheritance on a single root element).
 *
 * @example <BaseFacetChip label="Mugello" :pressed="true" :count="2" count-label="2 racconti" />
 */
import { computed } from "vue";
import { chipVariants } from "@/shared/variants/chip";

const props = defineProps<{
  /** The value's name, as drawn: «Mugello». */
  label: string;
  /** Whether the value is selected. */
  pressed: boolean;
  /** How many results the value would leave, drawn after the label. */
  count?: number;
  /** The count in words («2 racconti»), for the accessible name. */
  countLabel?: string;
}>();

const accessibleName = computed(() =>
  props.count !== undefined && props.countLabel !== undefined
    ? `${props.label} ${props.countLabel}`
    : undefined,
);
</script>

<template>
  <button
    type="button"
    :aria-pressed="props.pressed ? 'true' : 'false'"
    :aria-label="accessibleName"
    :class="chipVariants()"
  >
    <span>{{ props.label }}</span>
    <span v-if="props.count !== undefined" class="tabular-nums">{{ props.count }}</span>
  </button>
</template>
