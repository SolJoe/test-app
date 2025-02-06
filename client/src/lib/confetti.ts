import confetti from 'canvas-confetti';

export function triggerConfetti(coinId: string) {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 1000,
  };

  // Get coin-specific colors
  const colors = coinId === 'bitcoin' 
    ? ['#f7931a', '#ffd700'] // Bitcoin orange and gold
    : coinId === 'ethereum'
    ? ['#627eea', '#3c3c3d'] // Ethereum blue and dark
    : ['#f3ba2f', '#ffffff']; // Binance yellow and white

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Start the animation with multiple bursts
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors,
  });

  fire(0.2, {
    spread: 60,
    colors,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors,
  });
}