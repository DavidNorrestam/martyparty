<script lang="ts">
  import type { GameMode } from "$lib/gameModes";
  import QuizQuestionImage from "./questions/QuizQuestionImage.svelte";
  import QuizQuestionText from "./questions/QuizQuestionText.svelte";
  import QuizQuestionFreetext from "./questions/QuizQuestionFreetext.svelte";

  let {
    question,
    options,
    mode,
    loadingImages = false,
    onanswer
  } = $props<{
    question: { swedishName: string; latinName: string; images?: string[] };
    options: string[];
    mode: GameMode;
    loadingImages?: boolean;
    onanswer?: (answer: string) => void;
  }>();

  function handleAnswer(answer: string) {
    onanswer?.(answer);
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
