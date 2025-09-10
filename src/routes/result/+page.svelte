<script lang="ts">
  import { quiz } from "$lib/stores/quiz";
  import QuizResult from "$lib/QuizResult.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { get } from "svelte/store";
  import { asset, resolve } from "$app/paths";
  $: score = $quiz.score;
  $: total = $quiz.questions.length;
  $: mode = $quiz.mode;

  function parseFreetextAnswer(
    answer: string,
  ): { swedish: string; latin: string } | null {
    try {
      return JSON.parse(answer);
    } catch {
      return null;
    }
  }

  async function tryAgain() {
    // Always use the current mode from the quiz store
    const currentMode = $quiz.mode;
    if (!currentMode) return;
    const res = await fetch(asset("/plants.json"));
    let data = await res.json();
    // If image-to-swedish mode, fetch images for each plant (mimic quiz/+page.svelte logic)
    if (currentMode.id === "image-to-swedish") {
      // Optionally, refactor to share logic with quiz/+page.svelte
      data = await Promise.all(
        data.map(async (plant: any) => {
          // Fallback: just pass through images if present
          return { ...plant, images: plant.images || [] };
        }),
      );
    }
    quiz.start(data, currentMode);
    goto(`${resolve("/quiz")}?mode=${currentMode.id}`);
  }

  function goHome() {
    quiz.reset();
    goto(resolve("/"));
  }
</script>

<main class="centered-main">
  <QuizResult {score} {total} on:goHome={goHome} />

  {#if $quiz.questions.length > 0 && $quiz.answers.length === $quiz.questions.length && mode}
    <h3 style="margin-top:2rem;">Felaktiga svar</h3>
    <ul style="width:100%;max-width:420px;padding:0;list-style:none;">
      {#each $quiz.answers as ans, i}
        {#if !ans.correct}
          <li
            style="margin-bottom:1.5em;padding:1em;background:#f8fafc;border-radius:10px;box-shadow:0 1px 4px #0001;"
          >
            <div>
              <b>Fråga:</b>
              {ans.question.swedishName} ({ans.question.latinName})
            </div>
            {#if (mode.id === "image-to-swedish" || mode.id === "imageToNameFreetext") && ans.question.images && ans.question.images.length}
              <div style="display:flex;gap:1em;margin:0.5em 0;">
                {#each ans.question.images as url}
                  <img
                    src={url}
                    alt="Växtbild"
                    style="max-width:120px;max-height:140px;width:100%;height:140px;object-fit:cover;border-radius:8px;box-shadow:0 1px 4px #0001;background:#e5e7eb;"
                  />
                {/each}
              </div>
            {/if}
            <div>
              <b>Ditt svar:</b>
              {#if mode.id === "imageToNameFreetext"}
                {#if ans.answer}
                  {#if parseFreetextAnswer(ans.answer)}
                    {parseFreetextAnswer(ans.answer)?.swedish} / {parseFreetextAnswer(
                      ans.answer,
                    )?.latin}
                  {:else}
                    {ans.answer}
                  {/if}
                {:else}
                  {ans.answer}
                {/if}
              {:else}
                {ans.answer}
              {/if}
            </div>
            <script lang="ts">
              // ...existing imports and code...

              function parseAnswer(
                answer: string,
              ): { swedish: string; latin: string } | null {
                try {
                  return JSON.parse(answer);
                } catch {
                  return null;
                }
              }
            </script>
            <div>
              <b>Rätt svar:</b>
              {ans.question.swedishName} / {ans.question.latinName}
            </div>
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
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
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
