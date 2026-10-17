<script setup lang="ts">
/**
 * Text input for the search island, bound with `v-model`. DS: Modulo › campo
 * (the control only). Same classes as the Astro `Field` control
 * (`shared/variants/field.ts`).
 *
 * The label is not part of this component: the island renders its own
 * visible `<label for>` next to it, as the DS requires («etichetta sempre
 * visibile»). Attributes such as `id`, `name`, `placeholder` or
 * `aria-describedby` are forwarded to the `<input>`; `class` is merged with
 * `cn()` (see BaseButton.vue for why `inheritAttrs` is off, and why the
 * input still binds the whole `$attrs`).
 *
 * @example <BaseInput id="cerca" v-model="query" type="search" />
 */
import type { ClassValue } from "clsx";
import { computed, useAttrs } from "vue";
import { cn } from "@/shared/helpers/cn";
import { type FieldState, fieldControl } from "@/shared/variants/field";

defineOptions({ inheritAttrs: false });

const model = defineModel<string>({ default: "" });

const props = withDefaults(
  defineProps<{
    /** Input type: `search` gives mobile keyboards a search key. */
    type?: "text" | "search" | "email";
    /** Visual and ARIA error state. */
    state?: FieldState;
  }>(),
  { type: "text", state: "default" },
);

const attrs = useAttrs();
const classes = computed(() =>
  cn(fieldControl({ state: props.state }), attrs["class"] as ClassValue),
);
</script>

<template>
  <input
    v-bind="$attrs"
    v-model="model"
    :type="props.type"
    :class="classes"
    :aria-invalid="props.state === 'error' ? 'true' : undefined"
  />
</template>
