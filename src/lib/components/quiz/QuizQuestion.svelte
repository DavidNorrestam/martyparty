<script lang="ts">
  import type { GameMode } from "$lib/gameModes";
  import QuizQuestionImage from "./questions/QuizQuestionImage.svelte";
  import QuizQuestionText from "./questions/QuizQuestionText.svelte";
  import QuizQuestionFreetext from "./questions/QuizQuestionFreetext.svelte";
  import { createEventDispatcher } from "svelte";

  let {
    question,
    options,
    mode,
    loadingImages = false,
  } = $props<{
    question: any;
    options: string[];
    mode: GameMode;
    loadingImages?: boolean;
  }>();

  const dispatch = createEventDispatcher();

  function handleAnswer(answer: string) {
    dispatch("answer", answer);
  }
</script>

<div class="mb-8 flex flex-col items-center">
  {#if mode?.id === "image-to-swedish"}
    <QuizQuestionImage
      {question}
      {options}
      {loadingImages}
      onanswer={handleAnswer}
    />
  {:else if mode?.id === "swedish-to-latin"}
    <QuizQuestionText {question} {options} onanswer={handleAnswer} />
  {:else if mode?.id === "imageToNameFreetext"}
    <QuizQuestionFreetext
      {question}
      {loadingImages}
      onanswer={handleAnswer}
    />
  {/if}
</div>
