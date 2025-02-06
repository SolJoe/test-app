import confetti from 'canvas-confetti';

const cryptoShapes = {
  bitcoin: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMS43NjcgMTkuMzM2YzQuNDY4IDAgOC4wOTMtMy42MjUgOC4wOTMtOC4wOTNTMTYuMjM1IDMuMTUgMTEuNzY3IDMuMTUgMy42NzQgNi43NzUgMy42NzQgMTEuMjQzczMuNjI1IDguMDkzIDguMDkzIDguMDkzeiIvPjxwYXRoIGQ9Ik0xMS43NjcgMTQuMTVhMi45MDcgMi45MDcgMCAxMDAtNS44MTQgMi45MDcgMi45MDcgMCAwMDAgNS44MTR6Ii8+PC9zdmc+",
  ethereum: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMiAyTDIgMTIuNTc1bDEwIDUuNzI1IDEwLTUuNzI1eiIvPjxwYXRoIGQ9Ik0yIDEyLjU3NWwxMCA1LjcyNSAxMC01LjcyNSIvPjwvc3ZnPg==",
  binancecoin: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PHBhdGggZD0iTTggMTJoOE04IDE2aDhNOCA4aDgiLz48L3N2Zz4="
};

export function triggerConfetti(coinId: string) {
  const shape = new Image();
  shape.src = cryptoShapes[coinId as keyof typeof cryptoShapes];

  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 1000,
    shapes: [shape],
    scalar: 2,
  };

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
    colors: ['#f7931a'], // Bitcoin orange
  });

  fire(0.2, {
    spread: 60,
    colors: ['#627eea'], // Ethereum blue
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#f3ba2f'], // Binance yellow
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}