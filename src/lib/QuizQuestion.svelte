<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input";
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import type { GameMode } from "./gameModes";
  export let question: {
    swedishName: string;
    latinName: string;
    images?: string[];
  } | null;
  export let options: string[];
  export let mode: GameMode;
  export let loadingImages: boolean = false;
  const dispatch = createEventDispatcher();

  // For freetext mode
  let swedishInput = "";
  let latinInput = "";

  function handleClick(option: string) {
    dispatch("answer", option);
  }

  function handleFreetextSubmit(e: Event) {
    e.preventDefault();
    dispatch(
      "answer",
      JSON.stringify({ swedish: swedishInput, latin: latinInput }),
    );
    swedishInput = "";
    latinInput = "";
    // Refocus after submit (ensure DOM is ready)
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>(
        ".freetext-input.swedish",
      );
      el?.focus();
    }, 0);
  }

  // Focus Swedish input on mount and when question changes
  import { afterUpdate, onMount } from "svelte";
  onMount(() => {
    if (mode?.id === "imageToNameFreetext") {
      const el = document.querySelector<HTMLInputElement>(
        ".freetext-input.swedish",
      );
      el?.focus();
    }
  });

  // Focus Swedish input only when question changes and mode is imageToNameFreetext
  let prevQuestionKey = "";
  $: {
    const key =
      mode?.id === "imageToNameFreetext" && question
        ? `${question.swedishName}|${question.latinName}`
        : "";
    if (key && key !== prevQuestionKey) {
      prevQuestionKey = key;
      setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>(
          ".freetext-input.swedish",
        );
        el?.focus();
      }, 0);
    }
  }
</script>

<div class="quiz-question">
  <!-- Question prompt and images -->
  {#if mode?.id === "image-to-swedish" || mode?.id === "imageToNameFreetext"}
    {#if question?.images && question.images.length > 0}
      <div class="quiz-carousel-wrapper">
        <Carousel.Root opts={{ align: "center", loop: true }}>
          <Carousel.Content class="-ml-4">
            {#each question.images as url}
              <Carousel.Item class="carousel-peek">
                <img src={url} alt="Växtbild" class="quiz-carousel-image" />
              </Carousel.Item>
            {/each}
          </Carousel.Content>
          <Carousel.Previous
            class="carousel-nav-btn prev"
            aria-label="Föregående bild"
          />
          <Carousel.Next
            class="carousel-nav-btn next"
            aria-label="Nästa bild"
          />
        </Carousel.Root>
      </div>
    {:else if loadingImages}
      <div class="quiz-image-placeholder">
        <span>Laddar bild...</span>
      </div>
    {/if}
  {/if}

  {#if mode?.id === "image-to-swedish"}
    <h3>Vad är det svenska namnet för växten på bilden?</h3>
  {:else if mode?.id === "swedish-to-latin"}
    <h3>
      Vad är det latinska namnet för <span>{question?.swedishName}</span>?
    </h3>
  {:else if mode?.id === "imageToNameFreetext"}
    <h3>
      Vad heter växten på bilderna? <span class="quiz-question-desc"
        >Ange både svenska och latinska namnet.</span
      >
    </h3>
  {/if}

  <!-- Divider between question and answer -->
  <div class="quiz-divider"></div>

  <!-- Answer section -->
  {#if mode?.id === "image-to-swedish" || mode?.id === "swedish-to-latin"}
    <div class="answer-grid">
      {#each options as option}
        <Button
          type="button"
          class="mode-toggle answer-btn"
          onclick={() => handleClick(option)}>{option}</Button
        >
      {/each}
    </div>
  {:else if mode?.id === "imageToNameFreetext"}
    <form on:submit|preventDefault={handleFreetextSubmit} class="freetext-form">
      <Input
        type="text"
        placeholder="Svenskt namn"
        bind:value={swedishInput}
        required
        autocomplete="off"
        class="freetext-input swedish"
      />
      <Input
        type="text"
        placeholder="Latinskt namn"
        bind:value={latinInput}
        required
        autocomplete="off"
        class="freetext-input"
      />
      <Button type="submit" class="mode-toggle" style="width:100%;"
        >Svara</Button
      >
    </form>
  {/if}
</div>

<style>
  .quiz-question {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .quiz-question h3 {
    font-size: 1.2rem;
    text-align: center;
  }
  .quiz-question-desc {
    display: block;
    font-size: 0.95em;
    font-weight: 400;
    color: #666;
    margin-top: 0.3em;
  }
  .quiz-carousel-wrapper {
    width: 100%;
    max-width: 420px;
    margin-bottom: 1em;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .quiz-carousel-image {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 2px 12px #0002;
    background: #e5e7eb;
    max-width: 340px;
    max-height: 220px;
    margin: 0 auto;
    display: block;
  }
  .carousel-peek {
    min-width: 70%;
    max-width: 340px;
    flex: 0 0 70%;
    padding-left: 1rem;
    padding-right: 1rem;
    box-sizing: border-box;
    transition: transform 0.3s;
  }
  @media (min-width: 600px) {
    .carousel-peek {
      min-width: 50%;
      flex: 0 0 50%;
    }
  }
  @media (min-width: 900px) {
    .carousel-peek {
      min-width: 33%;
      flex: 0 0 33%;
    }
  }
  .carousel-nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 50%;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px #0002;
    border: none;
    cursor: pointer;
    font-size: 1.3rem;
    color: #333;
    transition: background 0.2s;
  }
  .carousel-nav-btn.prev {
    left: 0.2rem;
  }
  .carousel-nav-btn.next {
    right: 0.2rem;
  }
  .quiz-image-placeholder {
    display: inline-block;
    width: 100%;
    max-width: 220px;
    height: 220px;
    border-radius: 12px;
    background: #e5e7eb;
    box-shadow: 0 2px 12px #0002;
    position: relative;
  }
  .quiz-image-placeholder span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #888;
  }
  .quiz-divider {
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #e5e7eb 0%, #cbd5e1 100%);
    margin: 1em 0 1.2em 0;
    border-radius: 2px;
    opacity: 0.7;
  }
  .answer-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1em;
    width: 420px;
    max-width: 100%;
    margin-bottom: 1em;
    min-height: 8.4em; /* 2 rows of 3.7em + gap */
    align-items: stretch;
    justify-items: stretch;
    /* Always reserve space for 2 rows of buttons */
  }
  .answer-btn {
    width: 100%;
    min-width: 0;
    min-height: 3.7em;
    font-size: 1em;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: normal;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    transition:
      background 0.15s,
      box-shadow 0.15s;
    box-sizing: border-box;
    padding: 0 0.7em;
  }
  /* Ensure the answer area never shrinks vertically, even for 1 row */
  @media (max-width: 600px) {
    .answer-grid {
      grid-template-columns: 1fr;
      width: 100%;
      min-height: 8.4em;
    }
  }
  .freetext-form {
    display: flex;
    flex-direction: column;
    gap: 1em;
    align-items: center;
    max-width: 340px;
    width: 100%;
    margin: 0 auto;
  }
  .freetext-input {
    font-size: 1.1em;
    padding: 0.7em 1em;
    border-radius: 8px;
    border: 1px solid #ccc;
    width: 100%;
  }
  @media (max-width: 600px) {
    .answer-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
