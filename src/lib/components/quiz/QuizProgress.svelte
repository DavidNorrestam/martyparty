<script lang="ts">
  export let current: number;
  export let total: number;
  import { Progress } from "$lib/components/ui/progress";
</script>

<div class="mb-4">
  <div class="text-base font-medium mb-2">Fråga {current} av {total}</div>
  <Progress value={current} max={total} aria-label="Quiz progress" />
</div>
