
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let score: number;
  export let total: number;
  const dispatch = createEventDispatcher();
</script>

<div class="quiz-result">
  <h2>Resultat</h2>
  <p>Du fick {score} av {total} rätt!</p>
  <button on:click={() => dispatch('goHome')}>Hem</button>
</div>

<style>
.quiz-result {
  text-align: center;
  margin-top: 2rem;
}
.quiz-result h2 {
  font-size: 2rem;
}
.quiz-result button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
}
</style>
