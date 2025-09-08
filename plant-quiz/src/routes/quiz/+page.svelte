
<script lang="ts">
  import { onMount } from 'svelte';
  import { quiz } from '$lib/stores/quiz';
  import { goto } from '$app/navigation';
  import QuizQuestion from '$lib/QuizQuestion.svelte';
  import QuizProgress from '$lib/QuizProgress.svelte';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';

  let loading = true;
  let mode: 'latin' | 'image-to-swedish' = 'latin';

  onMount(async () => {
    // Read mode from query param
    const urlMode = get(page).url.searchParams.get('mode');
    if (urlMode === 'image-to-swedish') mode = 'image-to-swedish';
    else mode = 'latin';

    const unsub = quiz.subscribe(state => {
      if (state.finished) {
        goto('/result');
      }
    });
    quiz.subscribe(state => {
      if (state.questions.length > 0) loading = false;
    });
    const res = await fetch('/plants.json');
    let data = await res.json();
    // Shuffle the questions (plants) array
    for (let i = data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [data[i], data[j]] = [data[j], data[i]];
    }

    // If image mode, prefetch images for all questions
    if (mode === 'image-to-swedish') {
      const images: string[][] = await Promise.all(
        data.map(async (plant: any) => {
          // Remove quoted substrings and ' sp.' or ' sp' at the end, then trim whitespace
          let latin = plant.latinName
            .replace(/"[^"]*"|'[^']*'/g, '') // remove anything in quotes
            .replace(/\s+sp\.?$/i, '') // remove ' sp.' or ' sp' at end
            .trim();
          // Only use genus for Antirrhinum majus
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
            let photos: string[] = [];
            if (taxonData.results && taxonData.results.length > 0 && taxonData.results[0].taxon_photos) {
              photos = taxonData.results[0].taxon_photos
                .map((p: any) => p.photo?.medium_url || p.photo?.url)
                .filter(Boolean);
            }
            // Filter for unique photo URLs
            let uniquePhotos = Array.from(new Set(photos));
            // If less than 3, fetch from observations API as fallback
            if (uniquePhotos.length < 3) {
              try {
                const obsResp = await fetch(`https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(latin)}&photos=true`);
                const obsData = await obsResp.json();
                if (obsData.results && obsData.results.length > 0) {
                  let obsPhotos = obsData.results
                    .flatMap((r: any) => (r.photos || []).map((p: any) => p.medium_url || p.url))
                    .filter(Boolean);
                  // Shuffle observation photos
                  for (let i = obsPhotos.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [obsPhotos[i], obsPhotos[j]] = [obsPhotos[j], obsPhotos[i]];
                  }
                  // Add only new unique images
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
        })
      );
      quiz.start(data, images, mode);
    } else {
      quiz.start(data, undefined, mode);
    }
    return unsub;
  });

  $: currentState = $quiz;

  function handleAnswer(answer: string) {
    quiz.answer(answer);
  }

  // Generate options for current question
  function getOptions(current: number) {
    if (!currentState.questions.length) return [];
    if (mode === 'image-to-swedish') {
      // Swedish name options
      const correct = currentState.questions[current].swedishName;
      const all = currentState.questions.map(q => q.swedishName);
      const options = [correct];
      while (options.length < 4 && all.length > options.length) {
        const candidate = all[Math.floor(Math.random() * all.length)];
        if (!options.includes(candidate)) options.push(candidate);
      }
      return options.sort(() => Math.random() - 0.5);
    } else {
      // Default: Latin name options
      const correct = currentState.questions[current].latinName;
      const all = currentState.questions.map(q => q.latinName);
      const options = [correct];
      while (options.length < 4 && all.length > options.length) {
        const candidate = all[Math.floor(Math.random() * all.length)];
        if (!options.includes(candidate)) options.push(candidate);
      }
      return options.sort(() => Math.random() - 0.5);
    }
  }

  // Use pre-fetched images from the quiz store for the current question
  let imageUrls: string[] = [];
  $: if (mode === 'image-to-swedish' && currentState.questions.length && !currentState.finished && $quiz.images) {
    imageUrls = $quiz.images[currentState.current] || [];
  } else {
    imageUrls = [];
  }
</script>

<main>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1em;">
    <h2 style="margin:0;">Quizfrågor</h2>
    <button on:click={() => goto('/')} style="padding:0.3em 1em;font-size:1em;">Hem</button>
  </div>
  {#if loading}
    <p>Laddar frågor...</p>
  {:else if currentState.questions.length && !currentState.finished}
    <QuizProgress current={currentState.current + 1} total={currentState.questions.length} />
    {#if mode === 'image-to-swedish'}
      <div style="text-align:center;margin-bottom:1em;display:flex;gap:1em;justify-content:center;">
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
    {:else}
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
