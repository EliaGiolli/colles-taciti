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
 *
 * The element still binds `$attrs` as a whole (`v-bind="$attrs"`), class
 * included. Vue then merges the caller's raw `px-4` with the `cn()` result,
 * which has already dropped `px-5`, so the outcome is the same. Binding
 * `$attrs` directly, rather than a copy without `class`, is what lets
 * vue-tsc know which attributes the component accepts
 * (`fallthroughAttributes` in tsconfig.json): with `strictTemplates` on,
 * `<BaseButton aria-expanded="true" @click="…">` would otherwise not
 * type-check.
 */
import type { ClassValue } from "clsx";
import { computed, useAttrs } from "vue";
import { cn } from "@/shared/helpers/cn";
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
</script>

<template>
  <a v-if="props.href !== undefined" v-bind="$attrs" :href="props.href" :class="classes">
    <slot />
    <span v-if="props.variant === 'link'" aria-hidden="true">&nbsp;→</span>
  </a>
  <button v-else v-bind="$attrs" :type="props.type" :class="classes">
    <slot />
    <span v-if="props.variant === 'link'" aria-hidden="true">&nbsp;→</span>
  </button>
</template>
