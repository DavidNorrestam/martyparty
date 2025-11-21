<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";

  let {
    question,
    options,
    onanswer,
  } = $props<{
    question: { swedishName: string } | null;
    options: string[];
    onanswer: (option: string) => void;
  }>();
</script>

<div class="flex flex-col items-center w-full">
  <h3 class="text-xl text-center mb-4">
    Vad är det latinska namnet för <span class="font-semibold"
      >{question?.swedishName}</span
    >?
  </h3>

  <div class="w-full h-[2px] bg-gradient-to-r from-gray-200 to-slate-300 my-4 rounded-sm opacity-70"></div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[420px]">
    {#each options as option}
      <Button
        type="button"
        variant="outline"
        class="w-full min-h-[3.7em] text-base whitespace-normal h-auto py-2 px-3"
        onclick={() => onanswer(option)}
      >
        {option}
      </Button>
    {/each}
  </div>
</div>
