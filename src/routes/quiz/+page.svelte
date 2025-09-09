
<script lang="ts">
  import { onMount } from 'svelte';
  import { quiz } from '$lib/stores/quiz';
  import { gameModes, type GameMode } from '$lib/gameModes';
  import { goto } from '$app/navigation';
  import QuizQuestion from '$lib/QuizQuestion.svelte';
  import QuizProgress from '$lib/QuizProgress.svelte';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
    import { asset, resolve } from '$app/paths';

  let loading = true;
  let mode: GameMode | undefined = undefined;

  // For test harness: expose mode selection
  let selectedModeId: string = '';



  async function fetchImagesForPlant(plant) {
    // Remove quoted substrings and ' sp.' or ' sp' at the end, then trim whitespace
    let latin = plant.latinName
      .replace(/"[^"]*"|'[^']*'/g, '')
      .replace(/\s+sp\.?$/i, '')
      .trim();
    if (plant.latinName.trim().toLowerCase() === 'antirrhinum majus') {
      latin = latin.split(' ')[0];
    }
    try {
      // Step 1: Get taxon id from taxa API
      const taxaResp = await fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(latin)}`);
      const taxaData = await taxaResp.json();
      if (!taxaData.results || taxaData.results.length === 0) return [];
      const taxonId = taxaData.results[0].id;
      // Step 2: Fetch taxon details to get taxon_photos
      const taxonResp = await fetch(`https://api.inaturalist.org/v1/taxa/${taxonId}`);
      const taxonData = await taxonResp.json();
      let photos = [];
      if (taxonData.results && taxonData.results.length > 0 && taxonData.results[0].taxon_photos) {
        photos = taxonData.results[0].taxon_photos
          .map((p) => p.photo?.medium_url || p.photo?.url)
          .filter(Boolean);
      }
      let uniquePhotos = Array.from(new Set(photos));
      // If less than 3, fetch from observations API as fallback
      if (uniquePhotos.length < 3) {
        try {
          const obsResp = await fetch(`https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(latin)}&photos=true`);
          const obsData = await obsResp.json();
          if (obsData.results && obsData.results.length > 0) {
            let obsPhotos = obsData.results
              .flatMap((r) => (r.photos || []).map((p) => p.medium_url || p.url))
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
          [uniquePhotos[i], uniquePhotos[j]] = [uniquePhotos[j], uniquePhotos[i]];
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
    mode = gameModes.find(m => m.id === modeId) || gameModes[0];
    selectedModeId = mode.id;
    loading = true;
    const res = await fetch(asset('/plants.json'));
    let data = await res.json();
    // If image-to-swedish mode, fetch images for each plant
    if (mode.id === 'image-to-swedish') {
      data = await Promise.all(data.map(async (plant) => {
        const images = await fetchImagesForPlant(plant);
        return { ...plant, images };
      }));
    }
    quiz.start(data, mode);
    loading = false;
  }


  onMount(async () => {
    // Read mode from query param
    const urlMode = get(page).url.searchParams.get('mode');
    const initialModeId = urlMode || gameModes[0].id;
    selectedModeId = initialModeId;
    await startQuizWithMode(initialModeId);

    const unsub = quiz.subscribe(state => {
      if (state.finished) {
        goto(resolve('/result'));
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

  // Use images from the current question if available
  let imageUrls: string[] = [];
  $: if (mode?.id === 'image-to-swedish' && currentState.questions.length && !currentState.finished) {
    imageUrls = currentState.questions[currentState.current]?.images || [];
  } else {
    imageUrls = [];
  }
</script>

<main>
  <button on:click={() => goto(resolve('/'))} style="padding:0.3em 1em;font-size:1em;">Hem</button>
  {#if loading}
    <p>Laddar frågor...</p>
  {:else if currentState.questions.length && !currentState.finished}
    <QuizProgress current={currentState.current + 1} total={currentState.questions.length} />
    {#if mode?.id === 'image-to-swedish'}
      <div style="text-align:center;margin-bottom:1em;display:flex;gap:1em;justify-content:center;overflow-x:auto;">
        {#if imageUrls.length > 0}
          {#each imageUrls as url}
            <img src={url} alt="Växtbild" style="max-width:260px;max-height:320px;width:100%;height:320px;object-fit:cover;border-radius:12px;box-shadow:0 2px 12px #0002;background:#e5e7eb;" />
          {/each}
        {:else}
          <div style="display:inline-block;width:100%;max-width:260px;height:320px;border-radius:12px;background:#e5e7eb;box-shadow:0 2px 12px #0002;position:relative;">
            <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#888;">Laddar bild...</span>
          </div>
        {/if}
      </div>
      <QuizQuestion
        question={currentState.questions[currentState.current]}
        options={getOptions(currentState.current)}
        mode={mode}
        on:answer={e => handleAnswer(e.detail)}
      />
    {:else if mode?.id === 'swedish-to-latin'}
      <QuizQuestion
        question={currentState.questions[currentState.current]}
        options={getOptions(currentState.current)}
        mode={mode}
        on:answer={e => handleAnswer(e.detail)}
      />
    {/if}
  {:else}
    <p>Inga frågor tillgängliga.</p>
  {/if}
</main>
