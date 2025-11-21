<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
  import CheckIcon from "@lucide/svelte/icons/check";

  let { files, onselect } = $props<{
    files: Array<{ filename: string; plantCount: number; isPreprocessed: boolean }>;
    onselect: (filename: string) => void;
  }>();
</script>

<div>
  <p class="text-muted-foreground mb-4">
    Select a plant file to preprocess. Files that have already been preprocessed
    are marked with a checkmark.
  </p>

  <div class="grid gap-4">
    {#each files as file}
      <Card
        class="cursor-pointer hover:border-primary transition-colors"
        onclick={() => onselect(file.filename)}
      >
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <span>{file.filename}</span>
            {#if file.isPreprocessed}
              <span
                class="flex items-center gap-2 text-sm font-normal text-green-600"
              >
                <CheckIcon class="w-4 h-4" />
                Preprocessed
              </span>
            {/if}
          </CardTitle>
          <CardDescription>
            {file.plantCount} plants
          </CardDescription>
        </CardHeader>
      </Card>
    {/each}
  </div>
</div>
