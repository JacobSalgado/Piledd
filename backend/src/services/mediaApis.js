const USER_AGENT = process.env.API_USER_AGENT || 'Piledd/1.0';
const LIMIT = 12;
const OPEN_LIBRARY = 'https://openlibrary.org';
const JIKAN = 'https://api.jikan.moe/v4';

// http stuff
// outside API fails.
class UpstreamError extends Error {
    constructor(host, status) {
        super(`${host} responded with ${status}`);
        this.status = status === 429 ? 504 : status === 504 ? 504 : 502;
        this.publicMessage = 'Book and manga search is temporarily unavialble. Please try again shortly.'
    }
} 

async function fetchJson(url) {
    const host = new URL(url).hostname;
    let res;
    try {
        res = await fetch (url, {
            headers: { 'User-Agent': USER_AGENT, Accept: 'application/json'},
            signal: AbortSignal.timeout(8000), // never hang forever 
        });
    } catch (err) {
        // timeout or network failure (DNS, connection refused)
        throw new UpstreamError(host, err.name === 'TimeoutError' ? 504 : 502);
    }
    if (!res.ok) throw new UpstreamError(host, res.status);
    return res.json();
}

// build URL -> fetch -> pick the array -> normalize -> drop untitled items
async function fetchList(baseUrl, params, pick, normalize) {
    const query = new URLSearchParams({ limit: String(LIMIT), ...params});
    const data = await fetchJson(`${baseUrl}?${query}`);
    return (pick(data) ?? []).map(normalize).filter((item) => item.title);
}

// this normalizes jikan and openlibrary because they follow different formats so it puts it in similar ones
function fromOpenLibrary(doc, type) {
    const coverId = doc.cover_i ?? doc.cover_id;
    return {
        source: 'openlibrary',
        externalId: String(doc.key),
        type,
        title: doc.title ?? '',
        authors: doc.author_name ?? doc.authors?.map((a) => a.name) ?? [],
        coverUrl: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null,
        year: doc.first_publish_year ?? null,
        description: '',
    };
}

function fromJikan(manga) {
    return {
        source: 'jikan',
        externalId: String(manga.mal_id),
        type: 'manga',
        title: manga.title_english || manga.title || '',
        authors: (manga.authors ?? []).map((a) => a.name),
        coverUrl: manga.images?.jpg?.large_image_url ?? manga.images?.jpg?.image_url ?? null,
        year: manga.published?.prop?.from?.year ?? null,
        description: manga.synopsis ?? '',
    };
}

const asBook = (d) => fromOpenLibrary(d, 'book');
const asComic = (d) => fromOpenLibrary(d, 'comic');

// featured lists on the site
const trendingBooks = () =>
    fetchList(`${OPEN_LIBRARY}/trending/daily.json`, {}, (d) => d.works, asBook);

const graphicNovels = () =>
    fetchList(`${OPEN_LIBRARY}/subjects/graphic_novels.json`, {}, (d) => d.works, asComic);

const topManga = () =>
    fetchList(`${JIKAN}/top/manga`, {}, (d) => d.data, fromJikan);

// search feature
const searchBooks = (q) =>
    fetchList(`${OPEN_LIBRARY}/search.json`,
        {q, fields: 'key,title,author_name,cover_i,first_publish_year'},
        (d) => d.docs, asBook);

const searchManga = (q) => 
    fetchList(`${JIKAN}/manga`, { q, sfw: 'true' }, (d) => d.data, fromJikan);

module.exports = { trendingBooks, graphicNovels, topManga, searchBooks, searchManga, UpstreamError };