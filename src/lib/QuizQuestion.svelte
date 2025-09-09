
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let question: { swedishName: string; latinName: string };
  export let options: string[];
  export let mode: 'latin' | 'image-to-swedish' = 'latin';
  const dispatch = createEventDispatcher();
  function handleClick(option: string) {
    dispatch('answer', option);
  }
</script>

<div class="quiz-question">
  {#if mode === 'image-to-swedish'}
    <h3>Vad är det svenska namnet för växten på bilden?</h3>
  {:else}
    <h3>Vad är det latinska namnet för <span>{question.swedishName}</span>?</h3>
  {/if}
  <ul class="options-grid">
    {#each options as option}
      <li>
        <button type="button" class="mode-toggle" on:click={() => handleClick(option)}>{option}</button>
      </li>
    {/each}
  </ul>
</div>

<style>
.quiz-question {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.quiz-question h3 {
  font-size: 1.2rem;
  text-align: center;
}
.options-grid {
  list-style: none;
  padding: 0;
  width: 100%;
  max-width: 340px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.options-grid li {
  width: 100%;
  display: flex;
}
.quiz-question li {
  width: 100%;
}
.mode-toggle {
  width: 100%;
  min-height: 3.2rem;
  font-size: 1.12rem;
  padding: 0.9rem 1.2rem;
  font-weight: 500;
  border-radius: 10px;
}
</style>
