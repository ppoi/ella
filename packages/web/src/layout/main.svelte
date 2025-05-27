<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children] - コンテンツ
   */
  /** @type Props */
  let { children } = $props();
</script>

<main>
  {@render children?.()}
</main>
