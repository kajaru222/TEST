/**
 * Hero Section GSAP Animation
 * - top.cssのCSS transitionと連携するため、初期表示のみGSAPで制御
 * - 注意: scroll-animations.jsがis-visibleクラスを付与してCSSアニメーションを発火
 */
(() => {
  if (!document.body.classList.contains("page-top")) return;
  if (typeof window.gsap === "undefined") return;

  const gsap = window.gsap;

  const hero = document.querySelector(".panel-hero");
  if (!hero) return;

  // 正しいクラス名でセレクト
  // 注意: hero-markはtop.cssでfloatAnimationが設定されているためGSAP対象外
  const title = hero.querySelector(".hero-title");
  const lead = hero.querySelector(".hero-lead");
  const cta = hero.querySelector(".hero-cta");

  // GSAPアニメーションはCSS transitionと競合しないよう、is-visible後に実行
  // または、初期ロード時の追加演出として使用
  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    delay: 0.5 // is-visibleクラス付与後に開始
  });

  // 補助的なアニメーション（clearPropsでアニメーション後にインラインスタイルを削除）
  if (title) {
    tl.fromTo(title, { scale: 0.95 }, { scale: 1, duration: 0.7, clearProps: "transform" }, 0.2);
  }
  if (lead) {
    tl.fromTo(lead, { scale: 0.98 }, { scale: 1, duration: 0.6, clearProps: "transform" }, 0.3);
  }
  if (cta) {
    tl.fromTo(cta, { scale: 0.95 }, { scale: 1, duration: 0.6, clearProps: "transform" }, 0.4);
  }
})();