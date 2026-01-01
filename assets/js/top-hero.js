(() => {
  if (!document.body.classList.contains("page-top")) return;
  if (typeof window.gsap === "undefined") return;

  const gsap = window.gsap;

  const hero = document.querySelector(".panel-hero");
  if (!hero) return;

  const logo = hero.querySelector(".hero-logo");
  const lead = hero.querySelector(".hero-lead");
  const ctas = hero.querySelector(".hero-ctas");

  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
  if (logo) tl.fromTo(logo, { y: -16, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.9 }, 0);
  if (lead) tl.fromTo(lead, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.25);
  if (ctas) tl.fromTo(ctas, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.35);
})();