// Save Episode - Stores generated show scripts for the news site
// Uses Netlify Blobs for persistent storage

const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { showType, script, showName, youtubeUrl, generatedAt } = JSON.parse(event.body);

        if (!showType || !script) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'showType and script are required' }),
            };
        }

        const store = getStore({ name: 'episodes', consistency: 'strong' });

        // Create episode object
        const episode = {
            id: `${showType}-${Date.now()}`,
            showType,
            showName: showName || showType,
            script,
            youtubeUrl: youtubeUrl || '',
            generatedAt: generatedAt || new Date().toISOString(),
        };

        // Save individual episode
        await store.setJSON(episode.id, episode);

        // Update the episode index (list of all episode IDs, newest first)
        let index = [];
        try {
            const existing = await store.get('_index', { type: 'json' });
            if (existing) index = existing;
        } catch (e) {
            // No index yet, start fresh
        }

        index.unshift({
            id: episode.id,
            showType: episode.showType,
            generatedAt: episode.generatedAt,
        });

        // Keep last 200 episodes
        if (index.length > 200) index = index.slice(0, 200);

        await store.setJSON('_index', index);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, episodeId: episode.id }),
        };
    } catch (err) {
        console.error('Save episode error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
