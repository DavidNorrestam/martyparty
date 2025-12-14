<script lang="ts">
  import { quiz } from "$lib/stores/quiz";
  import { gameModes, type GameMode } from "$lib/gameModes";
  import { goto } from "$app/navigation";
  import QuizQuestion from "$lib/components/quiz/QuizQuestion.svelte";
  import QuizProgress from "$lib/components/quiz/QuizProgress.svelte";
  import { page } from "$app/stores";
  import { get } from "svelte/store";
  import { asset, resolve } from "$app/paths";
  import Button from "$lib/components/ui/button/button.svelte";
  import Card from "$lib/components/ui/card/card.svelte";
  import CardContent from "$lib/components/ui/card/card-content.svelte";
  import CardHeader from "$lib/components/ui/card/card-header.svelte";
  import CardTitle from "$lib/components/ui/card/card-title.svelte";

  let loading = true;
  let mode: GameMode<any> | undefined = undefined;

  // For test harness: expose mode selection
  let selectedModeId: string = "";

  import { fetchPlantData } from "$lib/utils/game-logic";

  async function startQuizWithMode(modeId: string, weekFile?: string) {
    const foundMode = gameModes.find((m) => m.id === modeId) || gameModes[0];
    mode = foundMode;
    selectedModeId = mode.id;
    loading = true;
    
    const data = await fetchPlantData(mode.id, weekFile);
    
    if (mode) quiz.start(data, mode);
    loading = false;
  }

  import { onMount } from "svelte";
  onMount(() => {
    // Read mode and week from query param
    const urlParams = get(page).url.searchParams;
    const urlMode = urlParams.get("mode");
    const urlWeek = urlParams.get("week") || undefined;
    
    const initialModeId = urlMode || gameModes[0].id;
    selectedModeId = initialModeId;
    startQuizWithMode(initialModeId, urlWeek);

    const unsub = quiz.subscribe((state) => {
      if (state.finished) {
        goto(resolve("/result"));
      }
    });
    return unsub;
  });

  $: currentState = $quiz;

  function handleAnswer(answer: string) {
    quiz.answer(answer);
  }

  // Use getOptions from the current game mode
  function getOptions(current: number) {
    if (!currentState.questions.length || !mode) return [];
    return mode.getOptions(currentState.questions, current);
  }

  // Track loading state for images
  let loadingImages = false;
  $: loadingImages =
    loading &&
    (mode?.id === "image-to-swedish" || mode?.id === "imageToNameFreetext");
</script>

<main>
  <!-- Floating Home Button -->
  <Button
    onclick={() => goto(resolve("/"))}
    class="fixed top-8 left-8 z-50 rounded-full px-6 py-3 text-lg shadow-md bg-background text-foreground border border-border transition-all hover:bg-muted hover:shadow-lg max-md:top-4 max-md:left-4 max-md:px-5 max-md:py-2 max-md:text-base"
    aria-label="Hem"
  >
    Hem
  </Button>

  {#if loading}
    <div class="fixed inset-0 flex flex-col items-center justify-center bg-background/25 backdrop-blur-[2.5px] z-[200] pointer-events-auto transition-colors">
      <div class="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mb-5"></div>
      <div class="text-xl text-foreground tracking-wide font-medium flex items-center justify-center min-h-[2em]">
        Laddar frågor<span class="opacity-20 animate-pulse text-xl ml-0.5">.</span><span class="opacity-20 animate-pulse delay-200 text-xl ml-0.5">.</span
        ><span class="opacity-20 animate-pulse delay-400 text-xl ml-0.5">.</span>
      </div>
    </div>
  {:else if currentState.questions.length && !currentState.finished}
    <div style="display: flex; justify-content: center; margin-top: 2em;">
      <Card
        style="max-width: 480px; width: 100%; min-height: 420px; box-shadow: 0 2px 16px #0001; position: relative; display: flex; flex-direction: column; justify-content: flex-start;"
      >
        <!-- Progress indicator inside card -->
        <div class="w-full flex justify-center items-center pt-5 pb-2 bg-transparent max-md:pt-3 max-md:pb-1">
          <QuizProgress
            current={currentState.current + 1}
            total={currentState.questions.length}
          />
        </div>
        <CardContent>
          {#if mode}
            <QuizQuestion
              question={currentState.questions[currentState.current]}
              options={getOptions(currentState.current)}
              {mode}
              {loadingImages}
              onanswer={handleAnswer}
            />
          {/if}
        </CardContent>
      </Card>
    </div>
  {:else}
    <p class="quiz-loading">Inga frågor tillgängliga.</p>
  {/if}
</main>


