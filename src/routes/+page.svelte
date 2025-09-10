<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	let mode: "swedish-to-latin" | "image-to-swedish" | "imageToNameFreetext" =
		"swedish-to-latin";
	function startQuiz() {
		goto(`${resolve("/quiz")}?mode=${mode}`);
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
