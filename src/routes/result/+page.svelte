<script lang="ts">
  import { quiz } from "$lib/stores/quiz";
  import QuizResult from "$lib/components/quiz/QuizResult.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { get } from "svelte/store";
  import { asset, resolve } from "$app/paths";
  import Card from "$lib/components/ui/card/card.svelte";
  import CardContent from "$lib/components/ui/card/card-content.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import QuizProgress from "$lib/components/quiz/QuizProgress.svelte";
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

  import { fetchPlantData } from "$lib/utils/game-logic";

  async function tryAgain() {
    // Always use the current mode from the quiz store
    const currentMode = $quiz.mode;
    if (!currentMode) return;
    
    const data = await fetchPlantData(currentMode.id);
    
    quiz.start(data, currentMode);
    goto(`${resolve("/quiz")}?mode=${currentMode.id}`);
  }

  function goHome() {
    quiz.reset();
    goto(resolve("/"));
  }
</script>

<!-- Floating Home Button -->
<!-- Floating Home Button -->
<Button onclick={goHome} class="fixed bottom-8 left-8 z-50 rounded-full px-6 py-3 text-lg shadow-md bg-card text-foreground border border-border transition-all hover:bg-muted hover:shadow-lg max-md:bottom-4 max-md:left-4 max-md:px-5 max-md:py-2 max-md:text-base" aria-label="Hem">Hem</Button>

<main>
  <div class="max-w-[420px] mx-auto bg-card rounded-[18px] shadow-lg p-10 flex flex-col items-center justify-center min-h-[60vh] max-md:p-4 max-md:min-h-[70vh]">
    <QuizResult {score} {total} />
    <hr class="w-full max-w-[420px] my-10 border-t-2 border-border" />
    {#if mode}
      <ul style="width:100%;max-width:420px;padding:0;list-style:none;">
        {#each $quiz.answers as ans, i}
          <li style="margin-bottom:1.5em;">
            <div class="w-full max-w-[420px] max-md:max-w-full">
              <Card class={ans.correct ? "border-2 border-success bg-success/10" : "border-2 border-destructive bg-destructive/10"}>
                <CardContent>
                  <div class="flex items-center gap-2 mb-2 text-lg">
                    <span
                      class="text-2xl leading-none align-middle select-none"
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
                    <div class="flex gap-4 my-2 flex-wrap justify-center">
                      {#each ans.question.images as url}
                        <img src={url} alt="Växtbild" class="max-w-[120px] max-h-[140px] w-full h-[140px] object-cover rounded-lg shadow-sm bg-muted block" />
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


