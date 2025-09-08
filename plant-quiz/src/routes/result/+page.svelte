

<script lang="ts">
  import { quiz } from '$lib/stores/quiz';
  import QuizResult from '$lib/QuizResult.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  $: score = $quiz.score;
  $: total = $quiz.questions.length;
  $: mode = $quiz.mode || 'latin';


  async function tryAgain() {
    // Always get mode from current URL
    let mode: 'latin' | 'image-to-swedish' = 'latin';
    try {
      if (typeof window !== 'undefined') {
        const urlMode = new URL(window.location.href).searchParams.get('mode');
        if (urlMode === 'image-to-swedish') mode = 'image-to-swedish';
      }
    } catch {}
    // Fetch questions and restart quiz in same mode
    const res = await fetch('/plants.json');
    const data = await res.json();
    quiz.start(data);
    goto(`/quiz?mode=${mode}`);
  }

  function goHome() {
    quiz.reset();
    goto('/');
  }
</script>

<main class="centered-main">
  <QuizResult {score} {total} on:goHome={goHome} />

  {#if $quiz.questions.length > 0 && $quiz.answers.length === $quiz.questions.length}
    <h3 style="margin-top:2rem;">Felaktiga svar</h3>
    <ul style="width:100%;max-width:420px;padding:0;list-style:none;">
      {#each $quiz.questions as q, i}
        {#if ($quiz.answers[i] !== q.swedishName && $quiz.answers[i] !== q.latinName)}
          <li style="margin-bottom:1.5em;padding:1em;background:#f8fafc;border-radius:10px;box-shadow:0 1px 4px #0001;">
            <div><b>Fråga:</b> {q.swedishName} ({q.latinName})</div>
            {#if mode === 'image-to-swedish' && $quiz.images && $quiz.images[i]?.length}
              <div style="display:flex;gap:1em;margin:0.5em 0;">
                {#each $quiz.images[i] as url}
                  <img src={url} alt="Växtbild" style="max-width:120px;max-height:140px;width:100%;height:140px;object-fit:cover;border-radius:8px;box-shadow:0 1px 4px #0001;background:#e5e7eb;" />
                {/each}
              </div>
            {/if}
            <div><b>Ditt svar:</b> {$quiz.answers[i]}</div>
            <div><b>Rätt svar:</b> {q.swedishName} / {q.latinName}</div>
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
</main>

<style>
.centered-main {
  max-width: 420px;
  margin: auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
@media (max-width: 600px) {
  .centered-main {
    padding: 1rem;
    min-height: 70vh;
  }
}
</style>
