<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "$lib/components/ui/card";

  let {
    plants,
    selectedPlantIndices,
    onback,
    oncontinue,
    ontoggle,
    onselectall,
    ondeselectall
  } = $props<{
    plants: Array<{ latinName: string; swedishName: string }>;
    selectedPlantIndices: Set<number>;
    onback: () => void;
    oncontinue: () => void;
    ontoggle: (index: number) => void;
    onselectall: () => void;
    ondeselectall: () => void;
  }>();
</script>

<div>
  <Button variant="outline" onclick={onback} class="mb-4">
    ← Back to file selection
  </Button>

  <Card class="mb-4">
    <CardHeader>
      <CardTitle>Select Plants for Automatic Processing</CardTitle>
      <CardDescription>
        Plants that are selected will be automatically processed using
        iNaturalist API. Deselect plants that need manual image curation (e.g.,
        cultivars).
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onclick={onselectall}
          >Select All</Button
        >
        <Button variant="outline" size="sm" onclick={ondeselectall}
          >Deselect All</Button
        >
      </div>

      <div class="space-y-2">
        {#each plants as plant, i}
          <label
            class="flex items-center gap-3 p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedPlantIndices.has(i)}
              onchange={() => ontoggle(i)}
              class="w-4 h-4 cursor-pointer"
            />
            <div class="flex-1">
              <p class="font-medium">{plant.latinName}</p>
              <p class="text-sm text-muted-foreground">
                {plant.swedishName}
              </p>
            </div>
          </label>
        {/each}
      </div>

      <div class="mt-6 p-4 bg-muted rounded-md">
        <p class="text-sm">
          <strong>Selected for auto-processing:</strong>
          {selectedPlantIndices.size} / {plants.length}
          <br />
          <strong>Manual curation needed:</strong>
          {plants.length - selectedPlantIndices.size}
        </p>
      </div>

      <Button onclick={oncontinue} class="mt-4 w-full">
        Continue to Image Selection
      </Button>
    </CardContent>
  </Card>
</div>
