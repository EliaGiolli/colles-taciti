<script setup lang="ts">
/**
 * How many items the archive is showing: «4 racconti», «24 libri», or the
 * empty state, «Nessun racconto qui, per ora.» (PLAN › Ricerca). DS: no
 * dedicated component; the metadata line (`ct-metariga`), and the page
 * text size for the empty state, which is a sentence, not a figure.
 *
 * `role="status"` makes it a polite live region: when the number changes
 * after a filter or a search, screen readers announce it once they finish
 * what they are saying, without moving the focus. It is rendered on the
 * server with the full count, so the region already exists when the first
 * change happens (a live region added together with its text is often not
 * announced at all).
 */
const props = defineProps<{
  count: number;
  /** The count in words, or the empty state (`searchCopy.kinds.*.count`). */
  label: string;
}>();
</script>

<template>
  <p
    role="status"
    :class="props.count === 0 ? 'text-corpo text-osso' : 'font-mono text-meta text-osso-muto'"
  >
    {{ props.label }}
  </p>
</template>
