<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { onMount } from "svelte";

	let mode: "swedish-to-latin" | "image-to-swedish" | "imageToNameFreetext" =
		"swedish-to-latin";
	
	let weekFiles: string[] = [];
	let selectedWeek = "plants.json";

	onMount(async () => {
		try {
			const res = await fetch(resolve("/api/quiz-files"));
			if (res.ok) {
				const data = await res.json();
				weekFiles = data.files || [];
			}
		} catch (e) {
			console.error("Failed to load week files", e);
		}
	});

	function startQuiz() {
		goto(`${resolve("/quiz")}?mode=${mode}&week=${selectedWeek}`);
	}

	function formatWeekName(filename: string): string {
		if (filename === "plants.json") return "Nuvarande vecka";
		
		// Extract week number if possible e.g. plants_week1.json -> Vecka 1
		const match = filename.match(/plants_week(\d+)\.json/);
		if (match) {
			return `Vecka ${match[1]}`;
		}
		
		return filename;
	}
</script>

<main class="flex flex-col items-center min-h-screen pt-8 sm:pt-16 md:pt-24">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-3xl font-bold text-center"
				>Växtquiz</Card.Title
			>
			<Card.Description class="text-lg text-center"
				>Välkommen till växtquizet! Testa dina kunskaper om växter.</Card.Description
			>
		</Card.Header>
		<Card.Content class="flex flex-col gap-3">
            <div class="mb-2">
                <label for="week-select" class="block text-sm font-medium mb-1 ml-1 text-muted-foreground">Välj vecka</label>
                <select 
                    id="week-select"
                    bind:value={selectedWeek}
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="plants.json">Nuvarande vecka</option>
                    {#each weekFiles.filter(f => f !== "plants.json") as file}
                        <option value={file}>{formatWeekName(file)}</option>
                    {/each}
                </select>
            </div>

			<Button
				variant="default"
				onclick={() => {
					mode = "swedish-to-latin";
					startQuiz();
				}}
				class="w-full"
			>
				Gissa latinskt namn
			</Button>
			<Button
				variant="default"
				onclick={() => {
					mode = "image-to-swedish";
					startQuiz();
				}}
				class="w-full"
			>
				Gissa svenskt namn från bild
			</Button>
			<Button
				variant="default"
				onclick={() => {
					mode = "imageToNameFreetext";
					startQuiz();
				}}
				class="w-full"
			>
				Bild till namn (fritext)
			</Button>
		</Card.Content>
	</Card.Root>
</main>
