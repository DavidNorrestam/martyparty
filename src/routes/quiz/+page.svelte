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

  // Always pick 2 taxon photos and 2 observation photos (fill up to 4)
  // Now uses preprocessed data instead of making API calls
  // Also handles manually curated photos
  function selectImagesForPlant(plant: {
    taxonPhotos?: string[];
    observationPhotos?: string[];
    manualPhotos?: string[];
  }) {
    // If manual photos exist, use those instead
    if (plant.manualPhotos && plant.manualPhotos.length > 0) {
      const shuffled = [...plant.manualPhotos];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, 4);
    }

    const taxonPhotos = plant.taxonPhotos || [];
    const observationPhotos = plant.observationPhotos || [];

    // Shuffle taxon photos
    const shuffledTaxon = [...taxonPhotos];
    for (let i = shuffledTaxon.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTaxon[i], shuffledTaxon[j]] = [
        shuffledTaxon[j],
        shuffledTaxon[i],
      ];
    }

    // Shuffle observation photos
    const shuffledObs = [...observationPhotos];
    for (let i = shuffledObs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledObs[i], shuffledObs[j]] = [shuffledObs[j], shuffledObs[i]];
    }

    // Pick 2 taxon photos and 2 observation photos (or as many as available)
    let selected: string[] = [];
    let taxonCount = Math.min(2, shuffledTaxon.length);
    let obsCount = Math.min(2, shuffledObs.length);

    selected = [
      ...shuffledTaxon.slice(0, taxonCount),
      ...shuffledObs.slice(0, obsCount),
    ];

    // Fill up to 4 photos if we have fewer
    if (selected.length < 4) {
      let fillTaxon = shuffledTaxon.slice(taxonCount);
      let fillObs = shuffledObs.slice(obsCount);
      let fill = [...fillTaxon, ...fillObs];
      for (let i = 0; i < fill.length && selected.length < 4; i++) {
        if (!selected.includes(fill[i])) selected.push(fill[i]);
      }
    }

    // Final shuffle of selected photos
    for (let i = selected.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selected[i], selected[j]] = [selected[j], selected[i]];
    }

    return selected;
  }

  async function startQuizWithMode(modeId: string) {
    const foundMode = gameModes.find((m) => m.id === modeId) || gameModes[0];
    mode = foundMode;
    selectedModeId = mode.id;
    loading = true;
    // Try to load preprocessed data first, fall back to original if not available
    let res = await fetch(asset("/preprocessed/plants.json"));
    if (!res.ok) {
      console.warn("Preprocessed data not found, falling back to original");
      res = await fetch(asset("/plants.json"));
    }
    let data = await res.json();
    // If mode requires images, select random images from preprocessed data
    if (
      mode &&
      (mode.id === "image-to-swedish" || mode.id === "imageToNameFreetext")
    ) {
      data = data.map((plant: any) => {
        const images = selectImagesForPlant(plant);
        return { ...plant, images };
      });
    }
    if (mode) quiz.start(data, mode);
    loading = false;
  }

  import { onMount } from "svelte";
  onMount(() => {
    // Read mode from query param
    const urlMode = get(page).url.searchParams.get("mode");
    const initialModeId = urlMode || gameModes[0].id;
    selectedModeId = initialModeId;
    startQuizWithMode(initialModeId);

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
    class="floating-home-btn"
    aria-label="Hem"
  >
    Hem
  </Button>

  {#if loading}
    <div class="quiz-loading-overlay">
      <div class="spinner"></div>
      <div class="loading-text">
        Laddar frågor<span class="dot one">.</span><span class="dot two">.</span
        ><span class="dot three">.</span>
      </div>
    </div>
  {:else if currentState.questions.length && !currentState.finished}
    <div style="display: flex; justify-content: center; margin-top: 2em;">
      <Card
        style="max-width: 480px; width: 100%; min-height: 420px; box-shadow: 0 2px 16px #0001; position: relative; display: flex; flex-direction: column; justify-content: flex-start;"
      >
        <!-- Progress indicator inside card -->
        <div class="card-progress-bar">
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
              on:answer={(e) => handleAnswer(e.detail)}
            />
          {/if}
        </CardContent>
      </Card>
    </div>
  {:else}
    <p class="quiz-loading">Inga frågor tillgängliga.</p>
  {/if}
</main>

<style>
  :global(.floating-home-btn) {
    position: fixed;
    top: 2rem;
    left: 2rem;
    z-index: 100;
    border-radius: 50px;
    padding: 0.7em 1.5em;
    font-size: 1.1em;
    box-shadow: 0 2px 8px #0002;
    background: #fff;
    color: #222;
    border: 1px solid #e5e7eb;
    transition:
      background 0.2s,
      box-shadow 0.2s;
  }
  :global(.floating-home-btn:hover) {
    background: #f3f4f6;
    box-shadow: 0 4px 16px #0002;
  }
  .quiz-loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.25); /* Less opaque */
    backdrop-filter: blur(2.5px); /* Subtle blur for modern look */
    z-index: 200;
    pointer-events: all;
    transition: background 0.2s;
  }
  .spinner {
    width: 48px;
    height: 48px;
    border: 5px solid #e5e7eb;
    border-top: 5px solid #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1.2em;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .loading-text {
    font-size: 1.3em;
    color: #222;
    letter-spacing: 0.02em;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2em;
  }
  .dot {
    opacity: 0.2;
    animation: blink 1.4s infinite both;
    font-size: 1.3em;
    margin-left: 0.1em;
  }
  .dot.one {
    animation-delay: 0s;
  }
  .dot.two {
    animation-delay: 0.2s;
  }
  .dot.three {
    animation-delay: 0.4s;
  }
  @keyframes blink {
    0%,
    80%,
    100% {
      opacity: 0.2;
    }
    40% {
      opacity: 1;
    }
  }

  .card-progress-bar {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.2em 0 0.5em 0;
    background: none;
  }
  @media (max-width: 600px) {
    :global(.floating-home-btn) {
      top: 1rem;
      left: 1rem;
      padding: 0.6em 1.2em;
      font-size: 1em;
    }
    .card-progress-bar {
      padding: 0.7em 0 0.3em 0;
    }
  }
</style>
