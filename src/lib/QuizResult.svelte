<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  export let score: number;
  export let total: number;
  const dispatch = createEventDispatcher();
</script>

<div class="quiz-result">
  <h2>Resultat</h2>
  <p>Du fick {score} av {total} rätt!</p>
  <Button onclick={() => dispatch("goHome")}>Hem</Button>
</div>

<style>
  .quiz-result {
    text-align: center;
    margin-top: 2rem;
  }
  .quiz-result h2 {
    font-size: 2rem;
  }
</style>
