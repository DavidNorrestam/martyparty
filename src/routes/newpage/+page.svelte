<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import { goto } from "$app/navigation";
</script>

<main
    style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh;"
>
    <h1>New Page</h1>
    <Button onclick={() => goto("/")}>Home</Button>
</main>
