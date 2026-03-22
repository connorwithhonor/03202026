// Research Engine - Pulls trending content from multiple sources
// Uses web search to find top-performing content in the last 24 hours

const SEARCH_SOURCES = {
    ai: {
        queries: [
            'artificial intelligence news today',
            'AI breakthrough latest 24 hours',
            'top AI videos today site:youtube.com',
            'AI news site:reddit.com last 24 hours',
            'ChatGPT Claude Gemini AI news today',
            'AI technology trending today',
        ],
        subreddits: ['artificial', 'MachineLearning', 'ChatGPT', 'LocalLLaMA', 'singularity'],
        keywords: ['AI', 'artificial intelligence', 'machine learning', 'ChatGPT', 'Claude', 'GPT', 'LLM', 'neural network', 'deep learning', 'AGI'],
    },
    fat: {
        queries: [
            'food addiction recovery news today',
            'intermittent fasting results latest',
            'weightlifting over 50 trending',
            'carbohydrate restriction weight loss new',
            'muscle mass aging prevention latest',
            'fasting weight loss transformation site:youtube.com',
            'food addiction recovery motivation',
            'keto carnivore results transformation',
        ],
        subreddits: ['fasting', 'intermittentfasting', 'loseit', 'fitness', 'over50fitness', 'foodaddiction', 'keto'],
        keywords: ['food addiction', 'fasting', 'weight loss', 'carb restriction', 'muscle mass', 'over 50', 'weightlifting', 'transformation', 'recovery'],
    },
    realestate: {
        queries: [
            'real estate market news today sellers',
            'home selling tips latest news',
            'real estate commission changes NAR latest',
            'seller agent representation news',
            'real estate broker news today',
            'home prices market update today',
            'listing agent best practices trending',
            'real estate seller rights buyer agent',
            'Santa Clarita Valley real estate market',
            'dual agency risks real estate',
        ],
        subreddits: ['RealEstate', 'realtors', 'FirstTimeHomeBuyer', 'RealEstateAdvice', 'homeowners'],
        keywords: ['seller', 'listing agent', 'real estate', 'home selling', 'commission', 'dual agency', 'fiduciary', 'broker', 'NAR', 'buyer agent', 'market update', 'home price', 'equity'],
    }
};

async function searchWeb(query, apiKey) {
    // Uses Brave Search API (free tier: 2000 queries/month)
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10&freshness=pd`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip',
                'X-Subscription-Token': apiKey,
            }
        });

        if (!response.ok) {
            console.error(`Search failed for "${query}": ${response.status}`);
            return [];
        }

        const data = await response.json();
        return (data.web?.results || []).map(r => ({
            title: r.title,
            url: r.url,
            description: r.description,
            age: r.age || '',
            source: new URL(r.url).hostname,
        }));
    } catch (err) {
        console.error(`Search error for "${query}":`, err.message);
        return [];
    }
}

async function searchReddit(subreddit, timeframe = 'day') {
    try {
        const url = `https://www.reddit.com/r/${subreddit}/top.json?t=${timeframe}&limit=10`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'ConnorTeleprompter/1.0' }
        });

        if (!response.ok) return [];

        const data = await response.json();
        return (data.data?.children || []).map(post => ({
            title: post.data.title,
            url: `https://reddit.com${post.data.permalink}`,
            score: post.data.score,
            comments: post.data.num_comments,
            subreddit: post.data.subreddit,
            selftext: (post.data.selftext || '').substring(0, 500),
        }));
    } catch (err) {
        console.error(`Reddit error for r/${subreddit}:`, err.message);
        return [];
    }
}

exports.handler = async (event) => {
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
        const { showType, lookbackHours } = JSON.parse(event.body);
        const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;

        if (!showType || !SEARCH_SOURCES[showType]) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid showType. Use "ai" or "fat".' })
            };
        }

        const config = SEARCH_SOURCES[showType];
        const results = {
            webResults: [],
            redditResults: [],
            timestamp: new Date().toISOString(),
            showType,
        };

        // Run web searches in parallel
        if (braveApiKey) {
            const searchPromises = config.queries.map(q => searchWeb(q, braveApiKey));
            const searchResults = await Promise.all(searchPromises);
            results.webResults = searchResults.flat();

            // Deduplicate by URL
            const seen = new Set();
            results.webResults = results.webResults.filter(r => {
                if (seen.has(r.url)) return false;
                seen.add(r.url);
                return true;
            });

            // Sort by relevance (items with more keyword matches rank higher)
            results.webResults.sort((a, b) => {
                const aScore = config.keywords.filter(k =>
                    (a.title + ' ' + a.description).toLowerCase().includes(k.toLowerCase())
                ).length;
                const bScore = config.keywords.filter(k =>
                    (b.title + ' ' + b.description).toLowerCase().includes(k.toLowerCase())
                ).length;
                return bScore - aScore;
            });

            results.webResults = results.webResults.slice(0, 20);
        }

        // Run Reddit searches in parallel
        const timeframe = (lookbackHours && lookbackHours > 24) ? 'week' : 'day';
        const redditPromises = config.subreddits.map(sub => searchReddit(sub, timeframe));
        const redditResults = await Promise.all(redditPromises);
        results.redditResults = redditResults.flat();

        // Sort Reddit by engagement
        results.redditResults.sort((a, b) => (b.score + b.comments * 2) - (a.score + a.comments * 2));
        results.redditResults = results.redditResults.slice(0, 15);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(results),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
