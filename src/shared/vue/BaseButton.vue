<script setup lang="ts">
/**
 * Vue twin of `shared/components/Button.astro`, for the search island.
 * Named BaseButton, not Button, so it can never be confused with the HTML
 * <button> element in a template (Vue style guide: multi-word, "Base" prefix).
 * DS: Pulsante. Same cva classes (`shared/variants/button.ts`), same rules:
 * `<a>` with `href`, otherwise `<button type="button">`, and the decorative
 * «→» on the `link` variant.
 *
 * Extra attributes (`aria-pressed`, `@click`…) are forwarded to the element.
 * `inheritAttrs: false` turns off Vue's automatic forwarding so that `class`
 * can go through `cn()` first: a caller's `class="px-4"` then replaces the
 * default `px-5` instead of both ending up on the element.
 */
import type { ClassValue } from "clsx";
import { computed, useAttrs } from "vue";
import { cn } from "@/shared/lib/cn";
import { type ButtonVariant, buttonVariants } from "@/shared/variants/button";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** DS weight of the button. */
    variant?: ButtonVariant;
    /** When set, renders a link. */
    href?: string;
    /** Button type when no `href` is given. */
    type?: "button" | "submit" | "reset";
  }>(),
  // `href` has no default: an optional prop that is not passed is already undefined.
  { variant: "secondary", type: "button" },
);

const attrs = useAttrs();
const classes = computed(() =>
  cn(buttonVariants({ variant: props.variant }), attrs["class"] as ClassValue),
);
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});
</script>

<template>
  <a v-if="props.href !== undefined" v-bind="forwarded" :href="props.href" :class="classes">
    <slot />
    <span v-if="props.variant === 'link'" aria-hidden="true">&nbsp;→</span>
  </a>
  <button v-else v-bind="forwarded" :type="props.type" :class="classes">
    <slot />
    <span v-if="props.variant === 'link'" aria-hidden="true">&nbsp;→</span>
  </button>
</template>
