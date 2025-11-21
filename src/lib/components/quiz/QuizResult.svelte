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

<div class="quiz-result">
  <h2>Resultat</h2>
  <div class="progress-container">
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle
        class="progress-bg"
        cx="60"
        cy="60"
        r="52"
        stroke="#e5e7eb"
        stroke-width="12"
        fill="none"
      />
      <circle
        class="progress-bar"
        cx="60"
        cy="60"
        r="52"
        stroke="#22c55e"
        stroke-width="12"
        fill="none"
        stroke-dasharray={2 * Math.PI * 52}
        stroke-dashoffset={2 * Math.PI * 52 * (1 - percent / 100)}
        stroke-linecap="round"
        style="transition: stroke-dashoffset 1s cubic-bezier(.4,2,.6,1);"
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
    <div class="congrats">🎉 Perfekt! Alla rätt! 🎉</div>
    {#if showConfetti}
      <canvas
        bind:this={confettiCanvas}
        class="confetti-canvas"
        width="320"
        height="180"
        aria-hidden="true"
      ></canvas>
    {/if}
  {/if}
</div>

<style>
  .quiz-result {
    text-align: center;
    margin-top: 2rem;
    position: relative;
    z-index: 1;
  }
  .quiz-result h2 {
    font-size: 2rem;
    margin-bottom: 1.2em;
  }
  .progress-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.2em;
    position: relative;
    z-index: 2;
  }
  .progress-bg {
    opacity: 0.4;
  }
  .progress-bar {
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    transition: stroke-dashoffset 1s cubic-bezier(0.4, 2, 0.6, 1);
  }
  .congrats {
    font-size: 1.3em;
    color: #22c55e;
    margin-top: 1.2em;
    font-weight: bold;
    letter-spacing: 0.02em;
    animation: pop 0.7s cubic-bezier(0.4, 2, 0.6, 1);
  }
  @keyframes pop {
    0% {
      transform: scale(0.7);
      opacity: 0;
    }
    60% {
      transform: scale(1.15);
      opacity: 1;
    }
    100% {
      transform: scale(1);
    }
  }
  .confetti-canvas {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 10;
    width: 320px;
    height: 180px;
    max-width: 100vw;
    max-height: 40vw;
  }
</style>
