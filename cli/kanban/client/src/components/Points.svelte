<script>
  /** @type {{ value?: number }} */
  let { value } = $props();
</script>

<span class="points mono" title={`${value} story points`}>{value}</span>
