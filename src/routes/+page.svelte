<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	let mode: 'latin' | 'image-to-swedish' = 'latin';
	function startQuiz() {
		goto(`${resolve('/quiz')}?mode=${mode}`);
	}
</script>

<main style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
	<h1>Växtquiz</h1>
	<p style="text-align: center;">Välkommen till växtquizet! Testa dina kunskaper om växter.</p>
	<div style="margin-bottom:1em; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; width: 100%; max-width: 340px;">
		<div style="display: flex; gap: 0.5rem; width: 100%; justify-content: center;">
			<button
				type="button"
				class="mode-toggle"
				on:click={() => { mode = 'latin'; startQuiz(); }}
			>
				Gissa latinskt namn
			</button>
			<button
				type="button"
				class="mode-toggle"
				on:click={() => { mode = 'image-to-swedish'; startQuiz(); }}
			>
				Gissa svenskt namn från bild
			</button>
		</div>
	</div>
</main>

<style>
main {
	min-height: 60vh;
}
.mode-toggle {
	background: #f1f5f9;
	border: 1.5px solid #e5e7eb;
	border-radius: 8px;
	padding: 0.75rem 1rem;
	font-size: 1rem;
	font-weight: 500;
	cursor: pointer;
	transition: background 0.12s, border 0.12s, color 0.12s;
	outline: none;
	color: #222;
	min-width: 120px;
}
.mode-toggle:focus {
	box-shadow: 0 0 0 2px #93c5fd;
}
</style>
