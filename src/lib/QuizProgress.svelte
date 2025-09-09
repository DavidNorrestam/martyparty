<script lang="ts">
  export let current: number;
  export let total: number;
</script>

<div class="quiz-progress" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total} tabindex="0">
  Fråga {current} av {total}
  <div class="progress-bar">
    <div class="progress" style="width: {100 * current / total}%"></div>
  </div>
</div>

<style>
.quiz-progress {
  margin-bottom: 1rem;
}
.progress-bar {
  background: #eee;
  border-radius: 4px;
  height: 8px;
  width: 100%;
  margin-top: 0.5rem;
}
.progress {
  background: #4caf50;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}
</style>
