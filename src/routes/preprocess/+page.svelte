<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { resolve, base } from "$app/paths";
    import { dev } from "$app/environment";
    import { Button } from "$lib/components/ui/button";
    
    import PreprocessFileSelection from "$lib/components/preprocess/PreprocessFileSelection.svelte";
    import PreprocessPlantSelection from "$lib/components/preprocess/PreprocessPlantSelection.svelte";
    import PreprocessImageSelection from "$lib/components/preprocess/PreprocessImageSelection.svelte";
    import PreprocessProcessing from "$lib/components/preprocess/PreprocessProcessing.svelte";

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

    // Image selection & Processing
    let currentPlantIndex = $state(0);
    let manualPlants = $state<{latinName: string, swedishName: string, photos: string[]}[]>([]);
    let selectedImages = $state<Set<string>>(new Set());
    let imageResults = $state<GoogleImage[]>([]);
    let loadingImages = $state(false);
    let processingStatus = $state("");
    let processingProgress = $state(0);

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

    function getManualPlants() {
        return plants.filter((_, i) => !selectedPlantIndices.has(i));
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
        selectedImages = newSelection;
    }

    function addManualImage(url: string) {
        const newSelection = new Set(selectedImages);
        newSelection.add(url);
        selectedImages = newSelection;
    }

    function removeManualImage(url: string) {
        const newSelection = new Set(selectedImages);
        newSelection.delete(url);
        selectedImages = newSelection;
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
        <PreprocessFileSelection {files} onselect={selectFile} />
    {:else if currentStep === "plant-selection"}
        <PreprocessPlantSelection
            {plants}
            {selectedPlantIndices}
            onback={reset}
            oncontinue={proceedToImageSelection}
            ontoggle={togglePlant}
            onselectall={selectAllPlants}
            ondeselectall={deselectAllPlants}
        />
    {:else if currentStep === "image-selection"}
        {@const plant = plants[currentPlantIndex]}
        {@const manualPlantsList = getManualPlants()}
        {@const currentManualIndex = manualPlantsList.indexOf(plant)}
        
        <PreprocessImageSelection
            {plant}
            {currentManualIndex}
            totalManualPlants={manualPlantsList.length}
            {selectedImages}
            {imageResults}
            {loadingImages}
            onback={() => (currentStep = "plant-selection")}
            ontoggle={toggleImage}
            onaddmanual={addManualImage}
            onremovemanual={removeManualImage}
            oncontinue={saveImagesAndContinue}
        />
    {:else if currentStep === "processing" || currentStep === "complete"}
        <PreprocessProcessing
            status={processingStatus}
            progress={processingProgress}
            isComplete={currentStep === "complete"}
            {selectedFile}
            autoCount={selectedPlantIndices.size}
            manualCount={manualPlants.length}
            onreset={reset}
        />
    {/if}
</div>
