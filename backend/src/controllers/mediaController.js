const mongoose = require('mongoose');
const Media = require('../models/Media');
const mediaApis = require('../services/mediaApis');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

const FEATURED_TTL = 30 * 60 * 1000; // 30 minutes
const SEARCH_TTL = 10 * 60 * 1000; // 10 minutes
const FEATURED_RETRY_TTL = 2 * 60 * 1000; // 2 minutes

const FEATURED_SECTIONS = [
    { id: 'books', title: 'Trending Books', fetcher: mediaApis.trendingBooks },
    { id: 'manga', title: 'Top Manga', fetcher: mediaApis.topManga},
    { id: 'comics', title: 'Graphic Novels & Comics', fetcher: mediaApis.graphicNovels },
];

const SEARCHERS = {
    book: mediaApis.searchBooks,
    manga: mediaApis.searchManga,
};

const keyOf = (item) => `${item.source}:${item.externalId}`;

// upserts title into mongoDB and returns them (with _id) in the original order
async function saveToCatalog(items) {
    const unique = [...new Map(items.map((i) => [keyOf(i), i])).values()];
    if (unique.length === 0) return [];

    await Media.bulkWrite(
        unique.map(({type, ...rest}) => ({
            updateOne: {
                filter: { source: rest.source, externalId: rest.externalId },
                update: { $set: rest, $setOnInsert: { type } },
                upsert: true,
            },
        }))
    );

    const docs = await Media.find({
        $or: unique.map(({source, externalId}) => ({source, externalId})),
    }).lean();

    // mongoDB doesn't preserve order, so restore API's ranking
    const byKey = new Map(docs.map((d) => [keyOf(d), d]));
    return unique.map((i) => byKey.get(keyOf(i))).filter(Boolean);
}

// GET /api/media/featured
exports.getFeatured = async (req, res) => {
    const cached = cache.get('featured');
    if (cached) return res.json({ sections: cached });

    // allSettled so one failiing API doesn't break the whole homepage
    const results = await Promise.allSettled(FEATURED_SECTIONS.map((s) => s.fetcher()));

    const sections = [];
    for (const [index, result] of results.entries()) {
        const {id, title} = FEATURED_SECTIONS[index];
        if (result.status === 'rejected') {
            logger.warn('External API failed', { section: id, error: result.reason?.message});
            continue;
        }
        sections.push({id, title, items: await saveToCatalog(result.value)});
    }

    // only cache a complete result so a temporary outage isn't cached for 30 min
    const complete = sections.length === FEATURED_SECTIONS.length;
    if (sections.length > 0) {
        cache.set('featured', sections, complete ? FEATURED_TTL : FEATURED_RETRY_TTL);
    }
    return res.json({sections});
};

// GET api media search
exports.search = async (req, res) => {
    const { q, type = 'book'} = req.query;

    // checks types explicitly since query params can arrive as arrays
    if (typeof q !== 'string' || q.trim().length < 2 || q.length > 100) {
    return res.status(400).json({ message: 'Search term must be 2 to 100 characters.' });
    }
    if (typeof type !== 'string' || !Object.hasOwn(SEARCHERS, type)) {
    return res.status(400).json({ message: 'Type must be "book" or "manga".' });
    }

    const term = q.trim();
    const cacheKey = `search:${type}:${term.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ results: cached });

    const results = await saveToCatalog(await SEARCHERS[type](term));
    cache.set(cacheKey, results, SEARCH_TTL);
    return res.json({ results });
};

// GET api media id
exports.getById = async (req, res) => {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
        return res.status(400).json({message: 'Invalid ID'});
    }

    const item = await Media.findById(req.params.id).lean();
    if (!item) return res.status(404).json({message: 'Title not found'});

    return res.json({item});
}