<script lang="ts">
  export let current: number;
  export let total: number;
  import { Progress } from "$lib/components/ui/progress";
</script>

<div class="quiz-progress">
  <div class="progress-label">Fråga {current} av {total}</div>
  <Progress value={current} max={total} aria-label="Quiz progress" />
</div>

<style>
  .quiz-progress {
    margin-bottom: 1rem;
  }
  .progress-label {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
</style>
