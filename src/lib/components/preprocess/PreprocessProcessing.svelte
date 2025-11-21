<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Progress } from "$lib/components/ui/progress";
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "$lib/components/ui/card";
  import CheckIcon from "@lucide/svelte/icons/check";
  import LoaderIcon from "@lucide/svelte/icons/loader-circle";

  let {
    status,
    progress,
    isComplete,
    selectedFile,
    autoCount,
    manualCount,
    onreset
  } = $props<{
    status: string;
    progress: number;
    isComplete: boolean;
    selectedFile: string | null;
    autoCount: number;
    manualCount: number;
    onreset: () => void;
  }>();
</script>

{#if !isComplete}
  <Card>
    <CardHeader>
      <CardTitle>Processing Plants...</CardTitle>
      <CardDescription>{status}</CardDescription>
    </CardHeader>
    <CardContent>
      <Progress value={progress} />
      <div class="flex items-center justify-center py-8">
        <LoaderIcon class="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
{:else}
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <CheckIcon class="w-6 h-6 text-green-600" />
        Preprocessing Complete!
      </CardTitle>
      <CardDescription>
        Successfully preprocessed {selectedFile}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-2">
        <p class="text-sm">
          <strong>Auto-processed plants:</strong>
          {autoCount}
          <br />
          <strong>Manually curated plants:</strong>
          {manualCount}
        </p>

        <Button onclick={onreset} class="mt-4">
          Process Another File
        </Button>
      </div>
    </CardContent>
  </Card>
{/if}
