<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Progress } from "$lib/components/ui/progress";
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "$lib/components/ui/card";
  import CheckIcon from "@lucide/svelte/icons/check";
  import LoaderIcon from "@lucide/svelte/icons/loader-circle";

  let {
    plant,
    currentManualIndex,
    totalManualPlants,
    selectedImages,
    imageResults,
    loadingImages,
    onback,
    ontoggle,
    onaddmanual,
    onremovemanual,
    oncontinue
  } = $props<{
    plant: { latinName: string; swedishName: string };
    currentManualIndex: number;
    totalManualPlants: number;
    selectedImages: Set<string>;
    imageResults: Array<{ url: string; thumbnail: string; title: string; source: string }>;
    loadingImages: boolean;
    onback: () => void;
    ontoggle: (url: string) => void;
    onaddmanual: (url: string) => void;
    onremovemanual: (url: string) => void;
    oncontinue: () => void;
  }>();
</script>

<div>
  <Button variant="outline" onclick={onback} class="mb-4">
    ← Back to plant selection
  </Button>

  <Card class="mb-4">
    <CardHeader>
      <CardTitle>Select Images for {plant.latinName}</CardTitle>
      <CardDescription>
        {plant.swedishName} • Plant {currentManualIndex + 1} of {totalManualPlants}
        <br />
        <span class="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
          Search query: "{plant.latinName}"
        </span>
        <br />
        Select at least 10 representative images. Click on images to
        select/deselect.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="mb-4 p-4 bg-muted rounded-md">
        <p class="text-sm">
          <strong>Selected:</strong>
          {selectedImages.size} / minimum 10
        </p>
        <Progress value={(selectedImages.size / 10) * 100} class="mt-2" />
      </div>

      <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p class="text-sm font-semibold mb-2">
          Manual Image URL Entry
        </p>
        <p class="text-xs text-muted-foreground mb-2">
          If automatic search isn't working, search Google Images manually and
          paste image URLs here:
        </p>
        <div class="flex gap-2">
          <Input
            type="text"
            placeholder="Paste image URL and press Enter"
            onkeydown={(e) => {
              if (e.key === "Enter") {
                const input = e.currentTarget;
                const url = input.value.trim();
                if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
                  onaddmanual(url);
                  input.value = "";
                }
              }
            }}
            class="flex-1"
          />
        </div>
        <p class="text-xs text-muted-foreground mt-2">
          Tip: Right-click image in Google → "Copy image address"
        </p>
      </div>

      {#if loadingImages}
        <div class="flex items-center justify-center py-12">
          <LoaderIcon class="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      {:else if imageResults.length === 0 && selectedImages.size === 0}
        <p class="text-muted-foreground text-center py-12">
          No images found automatically. Use the manual URL entry above.
        </p>
      {:else if imageResults.length === 0}
        <div class="mb-4">
          <p class="text-sm font-semibold mb-2">
            Manually Added Images ({selectedImages.size})
          </p>
          <div class="space-y-2">
            {#each Array.from(selectedImages) as url}
              <div class="flex items-center gap-2 p-2 bg-muted rounded-md">
                <CheckIcon class="w-4 h-4 text-green-600 flex-shrink-0" />
                <span class="text-xs truncate flex-1">{url}</span>
                <button
                  type="button"
                  onclick={() => onremovemanual(url)}
                  class="text-destructive hover:text-destructive/80 text-xs"
                >
                  Remove
                </button>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {#each imageResults as image}
            <button
              type="button"
              class="relative cursor-pointer group text-left"
              onclick={() => ontoggle(image.url)}
            >
              <div
                class="aspect-square rounded-md overflow-hidden border-2 {selectedImages.has(
                  image.url
                )
                  ? 'border-primary'
                  : 'border-transparent'} hover:border-primary/50 transition-colors"
              >
                <img
                  src={image.thumbnail}
                  alt={image.title || plant.latinName}
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              {#if selectedImages.has(image.url)}
                <div
                  class="absolute top-2 right-2 bg-primary rounded-full p-1"
                >
                  <CheckIcon class="w-4 h-4 text-primary-foreground" />
                </div>
              {/if}
              <a
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-muted-foreground hover:text-foreground mt-1 block truncate"
                onclick={(e) => e.stopPropagation()}
              >
                {image.source}
              </a>
            </button>
          {/each}
        </div>
      {/if}

      <Button
        onclick={oncontinue}
        disabled={selectedImages.size < 10}
        class="mt-6 w-full"
      >
        {currentManualIndex < totalManualPlants - 1
          ? "Next Plant"
          : "Start Processing"}
      </Button>
    </CardContent>
  </Card>
</div>
