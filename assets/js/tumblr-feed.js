/* Tumblr feed renderer (stories page)
 * Fetches posts directly from Tumblr RSS feed via CORS proxy
 */

(function () {
  const root = document.getElementById('tumblr-feed');
  if (!root) return;

  const TUMBLR_BLOG = 'kohlongenn'; // Your Tumblr blog name
  const POSTS_LIMIT = 12;

  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  };

  const formatDate = (pubDate) => {
    try {
      const d = new Date(pubDate);
      if (Number.isNaN(d.getTime())) return '';
      // yyyy/mm/dd
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}/${m}/${day}`;
    } catch {
      return '';
    }
  };

  const extractImageFromContent = (content) => {
    if (!content) return null;
    // Extract first image from HTML content
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
    return null;
  };

  const stripHtmlTags = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const createExcerpt = (content, maxLength = 150) => {
    const text = stripHtmlTags(content);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const render = (items) => {
    if (!items || items.length === 0) {
      root.innerHTML = '<div class="tumblr-empty">投稿が見つかりませんでした。</div>';
      return;
    }

    const cards = items
      .map((it) => {
        const date = formatDate(it.pubDate);
        const img = it.image
          ? `<div class="tumblr-thumb" style="background-image:url('${it.image}')"></div>`
          : `<div class="tumblr-thumb tumblr-thumb--empty"></div>`;
        return `
          <a class="tumblr-card" href="${escapeHtml(it.link)}" target="_blank" rel="noopener noreferrer">
            ${img}
            <div class="tumblr-body">
              <h3 class="tumblr-title">${escapeHtml(it.title)}</h3>
              ${date ? `<div class="tumblr-date">${escapeHtml(date)}</div>` : ''}
              ${it.excerpt ? `<div class="tumblr-excerpt">${escapeHtml(it.excerpt)}</div>` : ''}
            </div>
          </a>
        `;
      })
      .join('');

    root.innerHTML = cards;
  };

  const showLoading = () => {
    root.innerHTML = '<div class="tumblr-loading">読み込み中...</div>';
  };

  const showError = (message) => {
    root.innerHTML = `<div class="tumblr-error">${escapeHtml(message)}</div>`;
  };

  const load = async () => {
    try {
      showLoading();

      // Use RSS2JSON service to convert RSS to JSON and bypass CORS
      const rssUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://${TUMBLR_BLOG}.tumblr.com/rss`;

      const res = await fetch(rssUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (data.status === 'ok' && data.items) {
        // Convert RSS2JSON format to our format
        const posts = data.items.slice(0, POSTS_LIMIT).map(item => ({
          title: item.title || 'Untitled',
          link: item.link || '#',
          pubDate: item.pubDate || '',
          image: item.thumbnail || extractImageFromContent(item.description),
          excerpt: createExcerpt(item.description || item.content)
        }));

        render(posts);
      } else {
        throw new Error('Invalid RSS feed response');
      }
    } catch (e) {
      console.error('[tumblr-feed] failed:', e);
      showError('投稿の読み込みに失敗しました。しばらくしてから再度お試しください。');
    }
  };

  // Start loading
  load();
})();
