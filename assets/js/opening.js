/**
 * Opening Splash Screen Controller
 * 初回訪問時のみオープニングを表示
 */
(() => {
  const splash = document.getElementById('openingSplash');
  const skipBtn = document.getElementById('openingSkip');

  if (!splash) return;

  const backgroundNodes = Array.from(document.body.children).filter((node) => node !== splash);

  const setBackgroundInert = (isInert) => {
    backgroundNodes.forEach((node) => {
      if (isInert) {
        node.setAttribute('inert', '');
        node.setAttribute('aria-hidden', 'true');
      } else {
        node.removeAttribute('inert');
        node.removeAttribute('aria-hidden');
      }
    });
  };

  // セッションストレージを確認（ブラウザを閉じるまで有効）
  const hasSeenOpening = sessionStorage.getItem('hasSeenOpening');

  // 既に見たことがある場合は即座に非表示
  if (hasSeenOpening === 'true') {
    setBackgroundInert(false);
    splash.classList.add('is-removed');
    return;
  }

  // オープニング表示フラグを立てる
  document.body.classList.add('opening-active');
  splash.setAttribute('aria-hidden', 'false');
  setBackgroundInert(true);

  // オープニングを終了する関数（yui540風パネルトランジション）
  const closeOpening = () => {
    // フラグを保存
    sessionStorage.setItem('hasSeenOpening', 'true');

    // Step 1: コンテンツフェードアウト + ライン上昇 + パネル展開
    splash.classList.add('is-closing');

    // Step 2: パネル展開完了後、パネルが外へ退場
    setTimeout(() => {
      splash.classList.add('is-hidden');
      document.body.classList.remove('opening-active');
      setBackgroundInert(false);
    }, 1200); // 0.5s delay + 0.7s duration

    // Step 3: パネル退場完了後に削除
    setTimeout(() => {
      splash.classList.add('is-removed');
      splash.setAttribute('aria-hidden', 'true');
    }, 1900); // + 0.6s パネル退場 + 余裕
  };

  // 自動で終了（4.5秒後）
  const autoCloseTimer = setTimeout(closeOpening, 4500);

  // スキップボタンのクリックイベント
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      clearTimeout(autoCloseTimer);
      closeOpening();
    });
  }

  // キーボード操作でスキップ（Enter, Space, Escape）
  const handleKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      clearTimeout(autoCloseTimer);
      closeOpening();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  document.addEventListener('keydown', handleKeydown);

  // クリックでもスキップ（スキップボタン以外の部分をクリック）
  splash.addEventListener('click', (e) => {
    // スキップボタン自体のクリックは除外
    if (e.target === skipBtn) return;

    clearTimeout(autoCloseTimer);
    closeOpening();
  });
})();
