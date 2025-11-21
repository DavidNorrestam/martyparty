<script lang="ts">
  import { onMount } from "svelte";
  export let score: number;
  export let total: number;
  let showConfetti = false;
  let percent = 0;
  let confettiCanvas: HTMLCanvasElement | null = null;

  // Animate the progress bar
  onMount(() => {
    percent = Math.round((score / total) * 100);
    if (score === total) {
      showConfetti = true;
      // Simple confetti burst (canvas)
      setTimeout(() => {
        if (confettiCanvas) {
          launchConfetti(confettiCanvas);
        }
      }, 300);
    }
  });

  // Minimal confetti burst
  function launchConfetti(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = (canvas.width = 320);
    const H = (canvas.height = 180);
    const confettiCount = 80;
    const confetti: {
      x: number;
      y: number;
      r: number;
      c: string;
      vx: number;
      vy: number;
    }[] = [];
    const colors = [
      "#FFD700",
      "#FF69B4",
      "#00CFFF",
      "#7CFC00",
      "#FF6347",
      "#FFB347",
    ];
    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        x: Math.random() * W,
        y: (Math.random() * H) / 2,
        r: 4 + Math.random() * 4,
        c: colors[Math.floor(Math.random() * colors.length)],
        vx: -2 + Math.random() * 4,
        vy: 2 + Math.random() * 3,
      });
    }
    let frame = 0;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of confetti) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = p.c;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
      }
      frame++;
      if (frame < 60) requestAnimationFrame(draw);
    }
    draw();
  }
</script>

<div class="text-center mt-8 relative z-[1]">
  <h2 class="text-3xl mb-5">Resultat</h2>
  <div class="flex justify-center items-center mb-5 relative z-[2]">
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle
        class="opacity-40"
        cx="60"
        cy="60"
        r="52"
        stroke="rgb(229, 231, 235)"
        stroke-width="12"
        fill="none"
      />
      <circle
        class="-rotate-90 origin-center transition-[stroke-dashoffset] duration-1000 ease-[cubic-bezier(0.4,2,0.6,1)]"
        cx="60"
        cy="60"
        r="52"
        stroke="rgb(34, 197, 94)"
        stroke-width="12"
        fill="none"
        stroke-dasharray={2 * Math.PI * 52}
        stroke-dashoffset={2 * Math.PI * 52 * (1 - percent / 100)}
        stroke-linecap="round"
      />
      <text x="60" y="68" text-anchor="middle" font-size="2.2em" fill="#222">
        {score}
      </text>
      <text x="60" y="92" text-anchor="middle" font-size="1em" fill="#888">
        / {total}
      </text>
    </svg>
  </div>
  <p>Du fick <b>{score}</b> av <b>{total}</b> rätt!</p>
  {#if score === total}
    <div class="text-xl text-success mt-5 font-bold tracking-wide animate-[var(--animate-pop)]">🎉 Perfekt! Alla rätt! 🎉</div>
    {#if showConfetti}
      <canvas
        bind:this={confettiCanvas}
        class="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none z-10 w-80 h-45 max-w-full max-h-[40vw]"
        width="320"
        height="180"
        aria-hidden="true"
      ></canvas>
    {/if}
  {/if}
</div>


