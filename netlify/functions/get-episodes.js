// Get Episodes - Retrieves published episodes for the news site
// Reads from Netlify Blobs

const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const store = getStore({ name: 'episodes', consistency: 'strong' });

        // Get the index
        let index = [];
        try {
            const existing = await store.get('_index', { type: 'json' });
            if (existing) index = existing;
        } catch (e) {
            // No episodes yet
        }

        // Parse query params for filtering
        const params = event.queryStringParameters || {};
        const showType = params.showType;
        const limit = parseInt(params.limit) || 50;

        // Filter by show type if specified
        let filteredIndex = showType
            ? index.filter(ep => ep.showType === showType)
            : index;

        // Limit results
        filteredIndex = filteredIndex.slice(0, limit);

        // Fetch full episode data
        const episodes = await Promise.all(
            filteredIndex.map(async (entry) => {
                try {
                    const episode = await store.get(entry.id, { type: 'json' });
                    return episode;
                } catch (e) {
                    return null;
                }
            })
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                episodes: episodes.filter(Boolean),
                total: index.length,
            }),
        };
    } catch (err) {
        console.error('Get episodes error:', err);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ episodes: [], total: 0 }),
        };
    }
};
