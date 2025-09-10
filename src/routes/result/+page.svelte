<script lang="ts">
  import { quiz } from "$lib/stores/quiz";
  import QuizResult from "$lib/QuizResult.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { get } from "svelte/store";
  import { asset, resolve } from "$app/paths";
  import Card from "$lib/components/ui/card/card.svelte";
  import CardContent from "$lib/components/ui/card/card-content.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import QuizProgress from "$lib/QuizProgress.svelte";
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

<header class="quiz-header">
  <div class="quiz-header__left">
    <Button onclick={goHome} class="home-btn">Hem</Button>
  </div>
  <div class="quiz-header__center">
    <!-- Hidden QuizProgress to match quiz screen height -->
    <div
      style="width:100%;display:flex;justify-content:center;opacity:0;pointer-events:none;user-select:none;"
      aria-hidden="true"
    >
      <QuizProgress current={1} total={1} />
    </div>
  </div>
  <div class="quiz-header__right"></div>
</header>

<main>
  <div class="centered-main">
    <QuizResult {score} {total} />
    <hr class="result-divider" />
    {#if mode}
      <ul style="width:100%;max-width:420px;padding:0;list-style:none;">
        {#each $quiz.answers as ans, i}
          <li style="margin-bottom:1.5em;">
            <div class="card-container">
              <Card class={ans.correct ? "correct-card" : "incorrect-card"}>
                <CardContent>
                  <div class="result-header">
                    <span
                      class="result-icon"
                      aria-label={ans.correct ? "Rätt" : "Fel"}
                      >{ans.correct ? "✔" : "❌"}</span
                    >
                    <b>{ans.correct ? "Rätt" : "Fel"}</b>
                  </div>
                  <div>
                    <b>Fråga:</b>
                    {#if mode.id === "image-to-swedish"}
                      Vad är det svenska namnet för växten på bilden?
                    {:else if mode.id === "swedish-to-latin"}
                      Vad är det latinska namnet för <span
                        >{ans.question.swedishName}</span
                      >?
                    {:else if mode.id === "imageToNameFreetext"}
                      Vad heter växten på bilderna? (Svenska och latin)
                    {:else}
                      {ans.question.swedishName} ({ans.question.latinName})
                    {/if}
                  </div>
                  {#if (mode.id === "image-to-swedish" || mode.id === "imageToNameFreetext") && ans.question.images && ans.question.images.length}
                    <div class="image-list">
                      {#each ans.question.images as url}
                        <img src={url} alt="Växtbild" class="answer-image" />
                      {/each}
                    </div>
                  {/if}
                  {#if !ans.correct}
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
                  {/if}
                  <div>
                    <b>Rätt svar:</b>
                    {#if mode.id === "image-to-swedish"}
                      {ans.question.swedishName}
                    {:else if mode.id === "swedish-to-latin"}
                      {ans.question.latinName}
                    {:else}
                      {ans.question.swedishName} / {ans.question.latinName}
                    {/if}
                  </div>
                </CardContent>
              </Card>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</main>

<style>
  /* Topbar styles (copied from quiz page) */
  .quiz-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem 2.2rem 1.2rem 1.2rem;
    background: #fafbfc;
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 2px 8px #0001;
    margin-bottom: 2.5rem;
    gap: 1.5rem;
    transition:
      background 0.2s,
      box-shadow 0.2s;
  }
  .quiz-header__left {
    flex: 0 0 auto;
  }
  .quiz-header__center {
    flex: 1 1 0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 2.2em;
  }
  .quiz-header__right {
    text-align: center;
    color: #64748b;
    font-size: 1.2em;
  }
  @media (max-width: 600px) {
    .quiz-header {
      flex-direction: row;
      align-items: center;
      padding: 0.5rem 0.5rem 0.5rem 0.5rem;
      gap: 0.5rem;
    }
    .quiz-header__left {
      flex: 0 0 auto;
      margin-right: 0.5rem;
    }
    .quiz-header__center {
      flex: 1 1 0;
      min-width: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
    }
    .quiz-header__center :global(.progress) {
      width: 100%;
      min-width: 0;
      max-width: 340px;
    }
  }

  /* Content container styles (copied from quiz page, adjusted for result) */
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
  .card-container {
    width: 100%;
    max-width: 420px;
  }
  :global(.correct-card) {
    border: 2px solid var(--success) !important;
    background: color-mix(in srgb, var(--success) 10%, var(--card)) !important;
  }
  :global(.incorrect-card) {
    border: 2px solid var(--destructive) !important;
    background: color-mix(
      in srgb,
      var(--destructive) 10%,
      var(--card)
    ) !important;
  }
  .result-header {
    display: flex;
    align-items: center;
    gap: 0.5em;
    margin-bottom: 0.5em;
    font-size: 1.1em;
  }
  .result-icon {
    font-size: 1.5em;
    line-height: 1;
    vertical-align: middle;
    user-select: none;
  }
  .image-list {
    display: flex;
    gap: 1em;
    margin: 0.5em 0;
    flex-wrap: wrap;
    justify-content: center;
  }
  .answer-image {
    max-width: 120px;
    max-height: 140px;
    width: 100%;
    height: 140px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 1px 4px #0001;
    background: #e5e7eb;
    display: block;
  }
  .result-divider {
    width: 100%;
    max-width: 420px;
    margin: 2.5rem 0 2rem 0;
    border: none;
    border-top: 2px solid #e5e7eb;
  }
  @media (max-width: 600px) {
    .centered-main {
      padding: 1rem;
      min-height: 70vh;
    }
    .card-container {
      max-width: 100%;
    }
  }
  .answer-image {
    max-width: 90px;
    height: 90px;
  }
</style>
