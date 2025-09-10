<script lang="ts">
  import { onMount } from "svelte";
  import { quiz } from "$lib/stores/quiz";
  import { gameModes, type GameMode } from "$lib/gameModes";
  import { goto } from "$app/navigation";
  import QuizQuestion from "$lib/QuizQuestion.svelte";
  import QuizProgress from "$lib/QuizProgress.svelte";
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

  async function fetchImagesForPlant(plant: { latinName: string }) {
    // Remove quoted substrings and ' sp.' or ' sp' at the end, then trim whitespace
    let latin = plant.latinName
      .replace(/"[^"]*"|'[^']*'/g, "")
      .replace(/\s+sp\.?$/i, "")
      .trim();
    if (plant.latinName.trim().toLowerCase() === "antirrhinum majus") {
      latin = latin.split(" ")[0];
    }
    try {
      // Step 1: Get taxon id from taxa API
      const taxaResp = await fetch(
        `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(latin)}`,
      );
      const taxaData = await taxaResp.json();
      if (!taxaData.results || taxaData.results.length === 0) return [];
      const taxonId = taxaData.results[0].id;
      // Step 2: Fetch taxon details to get taxon_photos
      const taxonResp = await fetch(
        `https://api.inaturalist.org/v1/taxa/${taxonId}`,
      );
      const taxonData = await taxonResp.json();
      let photos: string[] = [];
      if (
        taxonData.results &&
        taxonData.results.length > 0 &&
        taxonData.results[0].taxon_photos
      ) {
        photos = taxonData.results[0].taxon_photos
          .map((p: any) => p.photo?.medium_url || p.photo?.url)
          .filter(Boolean);
      }
      let uniquePhotos = Array.from(new Set(photos));
      // If less than 3, fetch from observations API as fallback
      if (uniquePhotos.length < 3) {
        try {
          const obsResp = await fetch(
            `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(latin)}&photos=true`,
          );
          const obsData = await obsResp.json();
          if (obsData.results && obsData.results.length > 0) {
            let obsPhotos = obsData.results
              .flatMap((r: any) =>
                (r.photos || []).map((p: any) => p.medium_url || p.url),
              )
              .filter(Boolean);
            for (let i = obsPhotos.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [obsPhotos[i], obsPhotos[j]] = [obsPhotos[j], obsPhotos[i]];
            }
            for (const url of obsPhotos) {
              if (uniquePhotos.length >= 3) break;
              if (!uniquePhotos.includes(url)) uniquePhotos.push(url);
            }
          }
        } catch {}
      }
      // Shuffle and pick up to 3
      if (uniquePhotos.length > 3) {
        for (let i = uniquePhotos.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [uniquePhotos[i], uniquePhotos[j]] = [
            uniquePhotos[j],
            uniquePhotos[i],
          ];
        }
        return uniquePhotos.slice(0, 3);
      } else if (uniquePhotos.length > 0) {
        return uniquePhotos;
      } else {
        return [];
      }
    } catch {
      return [];
    }
  }

  async function startQuizWithMode(modeId: string) {
    const foundMode = gameModes.find((m) => m.id === modeId) || gameModes[0];
    mode = foundMode;
    selectedModeId = mode.id;
    loading = true;
    const res = await fetch(asset("/plants.json"));
    let data = await res.json();
    // If mode requires images, fetch images for each plant
    if (
      mode &&
      (mode.id === "image-to-swedish" || mode.id === "imageToNameFreetext")
    ) {
      data = await Promise.all(
        data.map(async (plant: any) => {
          const images = await fetchImagesForPlant(plant);
          return { ...plant, images };
        }),
      );
    }
    if (mode) quiz.start(data, mode);
    loading = false;
  }

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
  <header class="quiz-header">
    <div class="quiz-header__left">
      <Button onclick={() => goto(resolve("/"))} class="home-btn">Hem</Button>
    </div>
    <div class="quiz-header__center">
      <div
        class:progress-inactive={loading ||
          !currentState.questions.length ||
          currentState.finished}
        aria-hidden={loading ||
          !currentState.questions.length ||
          currentState.finished}
        style="width:100%;display:flex;justify-content:center;"
      >
        <QuizProgress
          current={currentState.current + 1}
          total={currentState.questions.length}
        />
      </div>
    </div>
    <div class="quiz-header__right"></div>
  </header>

  {#if loading}
    <p class="quiz-loading">Laddar frågor...</p>
  {:else if currentState.questions.length && !currentState.finished}
    <div style="display: flex; justify-content: center; margin-top: 2em;">
      <Card
        style="max-width: 480px; width: 100%; box-shadow: 0 2px 16px #0001;"
      >
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
  .progress-inactive {
    opacity: 0;
    pointer-events: none;
    user-select: none;
    transition: opacity 0.2s;
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
</style>
