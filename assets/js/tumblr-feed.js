/* Tumblr feed renderer (stories page)
 * Fetches posts directly from Tumblr RSS feed via CORS proxy
 */

(function () {
  const root = document.getElementById('tumblr-feed');
  if (!root) return;

  const TUMBLR_BLOG = 'kohlongenn'; // Your Tumblr blog name
  const FEED_ENDPOINT = '/.netlify/functions/tumblr';
  const POSTS_LIMIT = 12;

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

  const safeUrl = (raw, { allowSubdomains = [], allowedProtocols = ['https:', 'http:'] } = {}) => {
    if (!raw) return '';
    try {
      const url = new URL(raw, window.location.href);
      if (!allowedProtocols.includes(url.protocol)) return '';
      if (allowSubdomains.length) {
        const host = url.hostname.toLowerCase();
        const ok = allowSubdomains.some((d) => host === d || host.endsWith(`.${d}`));
        if (!ok) return '';
      }
      return url.toString();
    } catch {
      return '';
    }
  };

  const clearRoot = () => {
    while (root.firstChild) root.removeChild(root.firstChild);
  };

  const render = (items) => {
    clearRoot();

    if (!items || items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'tumblr-empty';
      empty.textContent = '投稿が見つかりませんでした。';
      root.appendChild(empty);
      return;
    }

    const frag = document.createDocumentFragment();
    const allowedImageDomains = ['tumblr.com'];
    const allowedLinkDomains = [`${TUMBLR_BLOG}.tumblr.com`, 'tumblr.com'];

    items.forEach((it) => {
      const date = formatDate(it.pubDate);
      const linkUrl = safeUrl(it.link, { allowSubdomains: allowedLinkDomains });
      const imageUrl = safeUrl(it.image, { allowSubdomains: allowedImageDomains });

      const card = document.createElement('a');
      card.className = 'tumblr-card';
      card.href = linkUrl || '#';
      card.target = '_blank';
      card.rel = 'noopener noreferrer';

      const thumb = document.createElement('div');
      thumb.className = 'tumblr-thumb';
      if (imageUrl) {
        thumb.style.backgroundImage = `url("${imageUrl}")`;
      } else {
        thumb.classList.add('tumblr-thumb--empty');
      }
      card.appendChild(thumb);

      const body = document.createElement('div');
      body.className = 'tumblr-body';

      const title = document.createElement('h3');
      title.className = 'tumblr-title';
      title.textContent = it.title || 'Untitled';
      body.appendChild(title);

      if (date) {
        const dateEl = document.createElement('div');
        dateEl.className = 'tumblr-date';
        dateEl.textContent = date;
        body.appendChild(dateEl);
      }

      if (it.excerpt) {
        const excerpt = document.createElement('div');
        excerpt.className = 'tumblr-excerpt';
        excerpt.textContent = it.excerpt;
        body.appendChild(excerpt);
      }

      card.appendChild(body);
      frag.appendChild(card);
    });

    root.appendChild(frag);
  };

  const showLoading = () => {
    clearRoot();
    const loading = document.createElement('div');
    loading.className = 'tumblr-loading';
    loading.textContent = '読み込み中...';
    root.appendChild(loading);
  };

  const showError = (message) => {
    clearRoot();
    const error = document.createElement('div');
    error.className = 'tumblr-error';
    error.textContent = message || '読み込みに失敗しました。';
    root.appendChild(error);
  };

  const load = async () => {
    try {
      showLoading();

      const res = await fetch(`${FEED_ENDPOINT}?limit=${POSTS_LIMIT}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (data.items) {
        const posts = data.items.slice(0, POSTS_LIMIT).map((item) => ({
          title: item.title || 'Untitled',
          link: item.link || '#',
          pubDate: item.pubDate || '',
          image: item.image || extractImageFromContent(item.content || item.description),
          excerpt: createExcerpt(item.excerpt || item.content || item.description)
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
