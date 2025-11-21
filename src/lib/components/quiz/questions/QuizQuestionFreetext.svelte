<script lang="ts">
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input";
  import { onMount } from "svelte";

  let {
    question,
    loadingImages = false,
    onanswer,
  } = $props<{
    question: {
      swedishName: string;
      latinName: string;
      images?: string[];
    } | null;
    loadingImages?: boolean;
    onanswer: (answer: string) => void;
  }>();

  let swedishInput = $state("");
  let latinInput = $state("");
  let swedishInputEl = $state<HTMLInputElement | null>(null);

  function handleSubmit(e: Event) {
    e.preventDefault();
    onanswer(JSON.stringify({ swedish: swedishInput, latin: latinInput }));
    swedishInput = "";
    latinInput = "";
    
    // Refocus
    setTimeout(() => {
      swedishInputEl?.focus();
    }, 0);
  }

  // Focus on mount and when question changes
  $effect(() => {
    if (question) {
       setTimeout(() => {
        swedishInputEl?.focus();
      }, 0);
    }
  });
</script>

<div class="flex flex-col items-center w-full">
  {#if question?.images && question.images.length > 0}
    <div class="w-full max-w-[420px] mb-4 relative flex flex-col items-center">
      <Carousel.Root opts={{ align: "center", loop: true }}>
        <Carousel.Content class="-ml-4">
          {#each question.images as url}
            <Carousel.Item class="pl-4 basis-full">
              <img
                src={url}
                alt="Växtbild"
                class="w-full h-[220px] object-cover rounded-xl shadow-md bg-gray-200 max-w-[340px] mx-auto block"
              />
            </Carousel.Item>
          {/each}
        </Carousel.Content>
        <Carousel.Previous
          class="absolute top-1/2 -translate-y-1/2 left-1 z-10 bg-white/85 rounded-full w-10 h-10 flex items-center justify-center shadow-sm border-none cursor-pointer text-gray-800 hover:bg-white"
        />
        <Carousel.Next
          class="absolute top-1/2 -translate-y-1/2 right-1 z-10 bg-white/85 rounded-full w-10 h-10 flex items-center justify-center shadow-sm border-none cursor-pointer text-gray-800 hover:bg-white"
        />
      </Carousel.Root>
    </div>
  {:else if loadingImages}
    <div
      class="w-full max-w-[220px] h-[220px] rounded-xl bg-gray-200 shadow-md relative mb-4"
    >
      <span
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400"
        >Laddar bild...</span
      >
    </div>
  {/if}

  <h3 class="text-xl text-center mb-4">
    Vad heter växten på bilderna? <span class="block text-base font-normal text-gray-600 mt-1"
      >Ange både svenska och latinska namnet.</span
    >
  </h3>

  <div class="w-full h-[2px] bg-gradient-to-r from-gray-200 to-slate-300 my-4 rounded-sm opacity-70"></div>

  <form onsubmit={handleSubmit} class="flex flex-col gap-4 items-center w-full max-w-[340px]">
    <Input
      type="text"
      placeholder="Svenskt namn"
      bind:value={swedishInput}
      bind:ref={swedishInputEl}
      required
      autocomplete="off"
      class="text-lg p-3"
    />
    <Input
      type="text"
      placeholder="Latinskt namn"
      bind:value={latinInput}
      required
      autocomplete="off"
      class="text-lg p-3"
    />
    <Button type="submit" class="w-full">Svara</Button>
  </form>
</div>
