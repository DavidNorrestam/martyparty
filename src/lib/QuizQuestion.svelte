
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { GameMode } from './gameModes';
  export let question: { swedishName: string; latinName: string; images?: string[] };
  export let options: string[];
  export let mode: GameMode;
  const dispatch = createEventDispatcher();

  // For freetext mode
  let swedishInput = '';
  let latinInput = '';

  function handleClick(option: string) {
    dispatch('answer', option);
  }

  function handleFreetextSubmit(e: Event) {
    e.preventDefault();
    dispatch('answer', JSON.stringify({ swedish: swedishInput, latin: latinInput }));
    swedishInput = '';
    latinInput = '';
  }
</script>

<div class="quiz-question">
  {#if mode?.id === 'image-to-swedish'}
    <h3>Vad är det svenska namnet för växten på bilden?</h3>
    <ul class="options-grid">
      {#each options as option}
        <li>
          <button type="button" class="mode-toggle" on:click={() => handleClick(option)}>{option}</button>
        </li>
      {/each}
    </ul>
  {:else if mode?.id === 'swedish-to-latin'}
    <h3>Vad är det latinska namnet för <span>{question.swedishName}</span>?</h3>
    <ul class="options-grid">
      {#each options as option}
        <li>
          <button type="button" class="mode-toggle" on:click={() => handleClick(option)}>{option}</button>
        </li>
      {/each}
    </ul>
  {:else if mode?.id === 'imageToNameFreetext'}
    <h3>Vad heter växten på bilderna? Ange både svenska och latinska namnet.</h3>
    <form on:submit|preventDefault={handleFreetextSubmit} style="display:flex;flex-direction:column;gap:1em;align-items:center;max-width:340px;width:100%;margin:0 auto;">
      <input
        type="text"
        placeholder="Svenskt namn"
        bind:value={swedishInput}
        required
        autocomplete="off"
        style="font-size:1.1em;padding:0.7em 1em;border-radius:8px;border:1px solid #ccc;width:100%;"
      />
      <input
        type="text"
        placeholder="Latinskt namn"
        bind:value={latinInput}
        required
        autocomplete="off"
        style="font-size:1.1em;padding:0.7em 1em;border-radius:8px;border:1px solid #ccc;width:100%;"
      />
      <button type="submit" class="mode-toggle" style="width:100%;">Svara</button>
    </form>
  {/if}
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
