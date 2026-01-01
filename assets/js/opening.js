/**
 * Opening Splash Screen Controller
 * 初回訪問時のみオープニングを表示
 */
(() => {
  const splash = document.getElementById('openingSplash');
  const skipBtn = document.getElementById('openingSkip');

  if (!splash) return;

  // セッションストレージを確認（ブラウザを閉じるまで有効）
  const hasSeenOpening = sessionStorage.getItem('hasSeenOpening');

  // 既に見たことがある場合は即座に非表示
  if (hasSeenOpening === 'true') {
    splash.classList.add('is-removed');
    return;
  }

  // オープニング表示フラグを立てる
  document.body.classList.add('opening-active');
  splash.setAttribute('aria-hidden', 'false');

  // オープニングを終了する関数
  const closeOpening = () => {
    // フラグを保存
    sessionStorage.setItem('hasSeenOpening', 'true');

    // フェードアウト開始
    splash.classList.add('is-hidden');
    document.body.classList.remove('opening-active');

    // アニメーション完了後に完全に削除
    setTimeout(() => {
      splash.classList.add('is-removed');
      splash.setAttribute('aria-hidden', 'true');
    }, 800); // CSS の transition と同じ時間
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
