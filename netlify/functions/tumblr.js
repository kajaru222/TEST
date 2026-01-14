/**
 * Netlify Function: tumblr
 * Fetch Tumblr RSS and return simplified JSON for client-side rendering.
 *
 * Usage:
 *   /.netlify/functions/tumblr?limit=6
 */

const DEFAULT_RSS_URL = 'https://kohlongenn.tumblr.com/rss';

function decodeHtmlEntities(str = '') {
  // Minimal decode for RSS fields.
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(html = '') {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTagContent(itemXml, tagName) {
  // Support namespaced tags like content:encoded
  const safe = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<${safe}(?:\\s+[^>]*)?>([\\s\\S]*?)<\\/${safe}>`, 'i');
  const m = itemXml.match(re);
  if (!m) return '';
  // Remove CDATA wrapper if present
  return m[1].replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, '$1').trim();
}

function extractFirstImageUrl(html = '') {
  const m = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return m ? m[1] : '';
}

function parseRssToItems(rssText) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(rssText)) !== null) {
    const xml = m[1];
    const title = decodeHtmlEntities(getTagContent(xml, 'title'));
    const link = decodeHtmlEntities(getTagContent(xml, 'link'));
    const pubDate = decodeHtmlEntities(getTagContent(xml, 'pubDate'));
    const description = getTagContent(xml, 'description');
    const content = getTagContent(xml, 'content:encoded') || description;

    const image = extractFirstImageUrl(content) || extractFirstImageUrl(description);
    const text = stripHtml(decodeHtmlEntities(content || description));
    const excerpt = text.length > 140 ? `${text.slice(0, 140)}…` : text;

    items.push({
      title: title || '(untitled)',
      link,
      pubDate,
      excerpt,
      image,
    });
  }
  return items;
}

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const limit = Math.max(1, Math.min(20, parseInt(params.limit || '6', 10) || 6));
    const rssUrl = params.url || DEFAULT_RSS_URL;

    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Netlify Function; kohlongenn)',
        'Accept': 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1',
      },
    });

    if (!res.ok) {
      return {
        statusCode: 502,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
        body: JSON.stringify({ error: `Failed to fetch RSS (${res.status})` }),
      };
    }

    const text = await res.text();
    const items = parseRssToItems(text).slice(0, limit);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // Cache on CDN a bit, but keep it fresh enough for updates.
        'Cache-Control': 'public, max-age=0, s-maxage=300',
      },
      body: JSON.stringify({
        source: rssUrl,
        items,
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({ error: 'Unexpected error', detail: String(e) }),
    };
  }
};
