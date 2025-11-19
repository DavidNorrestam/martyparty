<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { resolve, base } from "$app/paths";
    import { dev } from "$app/environment";
    import { Button } from "$lib/components/ui/button";
    import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Progress } from "$lib/components/ui/progress";
    import CheckIcon from "@lucide/svelte/icons/check";
    import LoaderIcon from "@lucide/svelte/icons/loader-circle";

    interface PlantFile {
        filename: string;
        path: string;
        isPreprocessed: boolean;
        plantCount: number;
    }

    interface Plant {
        swedishName: string;
        latinName: string;
    }

    interface GoogleImage {
        url: string;
        thumbnail: string;
        title: string;
        source: string;
    }

    type Step =
        | "file-selection"
        | "plant-selection"
        | "image-selection"
        | "processing"
        | "complete";

    let files = $state<PlantFile[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let currentStep = $state<Step>("file-selection");

    // File selection
    let selectedFile = $state<string | null>(null);

    // Plant selection
    let plants = $state<Plant[]>([]);
    let selectedPlantIndices = $state<Set<number>>(new Set());

	onMount(async () => {
		// Redirect to home if not in development mode
		if (!dev) {
			goto(resolve('/'));
			return;
		}
		
		try {
			const response = await fetch(resolve('/api/preprocess'));
			if (!response.ok) {
				throw new Error('Failed to load files');
			}
			const data = await response.json();
			files = data.files;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			loading = false;
		}
	});onMount(async () => {
        try {
            const response = await fetch(resolve("/api/preprocess"));
            if (!response.ok) {
                throw new Error("Failed to load files");
            }
            const data = await response.json();
            files = data.files;
        } catch (e) {
            error = e instanceof Error ? e.message : "Unknown error";
        } finally {
            loading = false;
        }
    });

    async function selectFile(filename: string) {
        selectedFile = filename;

        // Load plants from the selected file
        try {
            const response = await fetch(`${base}/${filename}`);
            if (!response.ok) {
                throw new Error("Failed to load plants");
            }
            plants = await response.json();

            // Pre-select all plants by default
            selectedPlantIndices = new Set(plants.map((_, i) => i));
            currentStep = "plant-selection";
        } catch (e) {
            error =
                e instanceof Error ? e.message : "Failed to load plant data";
        }
    }

    function togglePlant(index: number) {
        if (selectedPlantIndices.has(index)) {
            selectedPlantIndices.delete(index);
        } else {
            selectedPlantIndices.add(index);
        }
        selectedPlantIndices = selectedPlantIndices; // Trigger reactivity
    }

    function selectAllPlants() {
        selectedPlantIndices = new Set(plants.map((_, i) => i));
    }

    function deselectAllPlants() {
        selectedPlantIndices = new Set();
    }

    async function proceedToImageSelection() {
        // Get the plants that need manual processing
        const manualPlantIndices = plants
            .map((_, i) => i)
            .filter((i) => !selectedPlantIndices.has(i));

        if (manualPlantIndices.length === 0) {
            // No manual processing needed, go straight to processing
            await startProcessing();
            return;
        }

        currentPlantIndex = manualPlantIndices[0];
        manualPlants = [];
        selectedImages = new Set();
        currentStep = "image-selection";

        await loadImagesForCurrentPlant();
    }

    async function loadImagesForCurrentPlant() {
        const plant =
            getManualPlants()[
                currentPlantIndex -
                    getManualPlants().indexOf(plants[currentPlantIndex])
            ];
        if (!plant) return;

        loadingImages = true;
        try {
            const response = await fetch(
                `${base}/api/google-images?q=${encodeURIComponent(plant.latinName)}`,
            );
            if (!response.ok) {
                throw new Error("Failed to load images");
            }
            const data = await response.json();
            imageResults = data.results || [];
        } catch (e) {
            error = e instanceof Error ? e.message : "Failed to load images";
        } finally {
            loadingImages = false;
        }
    }

    function toggleImage(url: string) {
        const newSelection = new Set(selectedImages);
        if (newSelection.has(url)) {
            newSelection.delete(url);
        } else {
            newSelection.add(url);
        }
        selectedImages = newSelection; // Create new Set to trigger reactivity
    }

    function getManualPlants() {
        return plants.filter((_, i) => !selectedPlantIndices.has(i));
    }

    async function saveImagesAndContinue() {
        const plant = plants[currentPlantIndex];
        manualPlants.push({
            latinName: plant.latinName,
            swedishName: plant.swedishName,
            photos: Array.from(selectedImages),
        });

        const manualPlantsList = getManualPlants();
        const currentManualIndex = manualPlantsList.indexOf(plant);

        if (currentManualIndex < manualPlantsList.length - 1) {
            // More plants to process
            currentPlantIndex = plants.indexOf(
                manualPlantsList[currentManualIndex + 1],
            );
            selectedImages = new Set();
            await loadImagesForCurrentPlant();
        } else {
            // Done with manual selection
            await startProcessing();
        }
    }

    async function startProcessing() {
        currentStep = "processing";
        processingStatus = "Starting preprocessing...";
        processingProgress = 0;

        try {
            const autoCount = selectedPlantIndices.size;
            const manualCount = manualPlants.length;
            const totalCount = autoCount + manualCount;

            // Update status
            processingStatus = `Processing ${totalCount} plants (${autoCount} automatic, ${manualCount} manual)...`;
            processingProgress = 10;

            // Simulate progress updates
            const progressInterval = setInterval(() => {
                if (processingProgress < 90) {
                    processingProgress += 5;
                }
            }, 500);

            const response = await fetch(resolve("/api/preprocess"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    filename: selectedFile,
                    autoProcessIndices: Array.from(selectedPlantIndices),
                    manualPlants,
                }),
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error("Preprocessing failed");
            }

            processingProgress = 100;
            processingStatus = "Complete!";
            currentStep = "complete";
        } catch (e) {
            error = e instanceof Error ? e.message : "Preprocessing failed";
            currentStep = "plant-selection";
        }
    }

    function reset() {
        currentStep = "file-selection";
        selectedFile = null;
        plants = [];
        selectedPlantIndices = new Set();
        manualPlants = [];
        imageResults = [];
        selectedImages = new Set();
        error = null;
    }
</script>

<div class="container mx-auto p-6 max-w-6xl">
    <h1 class="text-3xl font-bold mb-6">Interactive Plant Preprocessing</h1>

    {#if loading}
        <p class="text-muted-foreground">Loading plant files...</p>
    {:else if error}
        <div class="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
            <p class="font-semibold">Error</p>
            <p>{error}</p>
            <Button
                variant="outline"
                onclick={() => (error = null)}
                class="mt-2">Dismiss</Button
            >
        </div>
    {/if}

    {#if currentStep === "file-selection"}
        <div>
            <p class="text-muted-foreground mb-4">
                Select a plant file to preprocess. Files that have already been
                preprocessed are marked with a checkmark.
            </p>

            <div class="grid gap-4">
                {#each files as file}
                    <Card
                        class="cursor-pointer hover:border-primary transition-colors"
                        onclick={() => selectFile(file.filename)}
                    >
                        <CardHeader>
                            <CardTitle
                                class="flex items-center justify-between"
                            >
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
    {:else if currentStep === "plant-selection"}
        <div>
            <Button variant="outline" onclick={reset} class="mb-4">
                ← Back to file selection
            </Button>

            <Card class="mb-4">
                <CardHeader>
                    <CardTitle>Select Plants for Automatic Processing</CardTitle
                    >
                    <CardDescription>
                        Plants that are selected will be automatically processed
                        using iNaturalist API. Deselect plants that need manual
                        image curation (e.g., cultivars).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="flex gap-2 mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onclick={selectAllPlants}>Select All</Button
                        >
                        <Button
                            variant="outline"
                            size="sm"
                            onclick={deselectAllPlants}>Deselect All</Button
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
                                    onchange={() => togglePlant(i)}
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

                    <Button
                        onclick={proceedToImageSelection}
                        class="mt-4 w-full"
                    >
                        Continue to Image Selection
                    </Button>
                </CardContent>
            </Card>
        </div>
    {:else if currentStep === "image-selection"}
        {@const plant = plants[currentPlantIndex]}
        {@const manualPlantsList = getManualPlants()}
        {@const currentManualIndex = manualPlantsList.indexOf(plant)}

        <div>
            <Button
                variant="outline"
                onclick={() => (currentStep = "plant-selection")}
                class="mb-4"
            >
                ← Back to plant selection
            </Button>

            <Card class="mb-4">
                <CardHeader>
                    <CardTitle>Select Images for {plant.latinName}</CardTitle>
                    <CardDescription>
                        {plant.swedishName} • Plant {currentManualIndex + 1} of {manualPlantsList.length}
                        <br />
                        <span
                            class="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block"
                        >
                            Search query: "{plant.latinName}"
                        </span>
                        <br />
                        Select at least 10 representative images. Click on images
                        to select/deselect.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="mb-4 p-4 bg-muted rounded-md">
                        <p class="text-sm">
                            <strong>Selected:</strong>
                            {selectedImages.size} / minimum 10
                        </p>
                        <Progress
                            value={(selectedImages.size / 10) * 100}
                            class="mt-2"
                        />
                    </div>

                    <div
                        class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md"
                    >
                        <p class="text-sm font-semibold mb-2">
                            Manual Image URL Entry
                        </p>
                        <p class="text-xs text-muted-foreground mb-2">
                            If automatic search isn't working, search Google
                            Images manually and paste image URLs here:
                        </p>
                        <div class="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Paste image URL and press Enter"
                                onkeydown={(e) => {
                                    if (e.key === "Enter") {
                                        const input = e.currentTarget;
                                        const url = input.value.trim();
                                        if (
                                            url &&
                                            (url.startsWith("http://") ||
                                                url.startsWith("https://"))
                                        ) {
                                            const newSelection = new Set(
                                                selectedImages,
                                            );
                                            newSelection.add(url);
                                            selectedImages = newSelection;
                                            input.value = "";
                                        }
                                    }
                                }}
                                class="flex-1"
                            />
                        </div>
                        <p class="text-xs text-muted-foreground mt-2">
                            Tip: Right-click image in Google → "Copy image
                            address"
                        </p>
                    </div>

                    {#if loadingImages}
                        <div class="flex items-center justify-center py-12">
                            <LoaderIcon
                                class="w-8 h-8 animate-spin text-muted-foreground"
                            />
                        </div>
                    {:else if imageResults.length === 0 && selectedImages.size === 0}
                        <p class="text-muted-foreground text-center py-12">
                            No images found automatically. Use the manual URL
                            entry above.
                        </p>
                    {:else if imageResults.length === 0}
                        <div class="mb-4">
                            <p class="text-sm font-semibold mb-2">
                                Manually Added Images ({selectedImages.size})
                            </p>
                            <div class="space-y-2">
                                {#each Array.from(selectedImages) as url}
                                    <div
                                        class="flex items-center gap-2 p-2 bg-muted rounded-md"
                                    >
                                        <CheckIcon
                                            class="w-4 h-4 text-green-600 flex-shrink-0"
                                        />
                                        <span class="text-xs truncate flex-1"
                                            >{url}</span
                                        >
                                        <button
                                            type="button"
                                            onclick={() => {
                                                const newSelection = new Set(
                                                    selectedImages,
                                                );
                                                newSelection.delete(url);
                                                selectedImages = newSelection;
                                            }}
                                            class="text-destructive hover:text-destructive/80 text-xs"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {:else}
                        <div
                            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        >
                            {#each imageResults as image}
                                <button
                                    type="button"
                                    class="relative cursor-pointer group text-left"
                                    onclick={() => toggleImage(image.url)}
                                >
                                    <div
                                        class="aspect-square rounded-md overflow-hidden border-2 {selectedImages.has(
                                            image.url,
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
                                            <CheckIcon
                                                class="w-4 h-4 text-primary-foreground"
                                            />
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
                        onclick={saveImagesAndContinue}
                        disabled={selectedImages.size < 10}
                        class="mt-6 w-full"
                    >
                        {currentManualIndex < manualPlantsList.length - 1
                            ? "Next Plant"
                            : "Start Processing"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    {:else if currentStep === "processing"}
        <Card>
            <CardHeader>
                <CardTitle>Processing Plants...</CardTitle>
                <CardDescription>{processingStatus}</CardDescription>
            </CardHeader>
            <CardContent>
                <Progress value={processingProgress} />
                <div class="flex items-center justify-center py-8">
                    <LoaderIcon
                        class="w-8 h-8 animate-spin text-muted-foreground"
                    />
                </div>
            </CardContent>
        </Card>
    {:else if currentStep === "complete"}
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
                        {selectedPlantIndices.size}
                        <br />
                        <strong>Manually curated plants:</strong>
                        {manualPlants.length}
                    </p>

                    <Button onclick={reset} class="mt-4">
                        Process Another File
                    </Button>
                </div>
            </CardContent>
        </Card>
    {/if}
</div>
