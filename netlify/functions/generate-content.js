// Content Generator - Takes a script and generates ALL social media content via Claude API
// Outputs YouTube title, description, hashtags, Instagram, Facebook, LinkedIn, X, TikTok

const CONNOR_CONTEXT = `Connor's Properties & Links:
- CodedByConnor.com - https://codedbyconnor.com (AI & tech solutions)
- ConnorWithHonor.com - https://connorwithhonor.com (personal brand)
- HonorElevate.com - https://honorelevate.com (coaching & elevation)
- SCV123.com - https://scv123.com (Santa Clarita Valley real estate - Selling as Easy as SCV 123)
- TheLastAddiction.com - Food addiction recovery

For real estate content: Emphasize SCV123.com prominently. Position Connor as a dedicated seller's agent.
Focus on education, protecting seller equity, and the SCV 123 selling system.

Always include at least 2-3 of these links naturally in the content.
YouTube content should reference ALL properties.`;

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
        const { script, youtubeUrl, showType, platforms } = JSON.parse(event.body);
        const anthropicKey = process.env.ANTHROPIC_API_KEY;

        if (!anthropicKey) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'ANTHROPIC_API_KEY not configured.',
                    setup: 'Go to Netlify Dashboard > Site Settings > Environment Variables > Add ANTHROPIC_API_KEY'
                })
            };
        }

        if (!script) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Script is required.' }) };
        }

        const ytLink = youtubeUrl || '[YOUTUBE LINK - paste after upload]';

        const systemPrompt = `You are Connor's content repurposing engine. You take a video script and create perfectly optimized content for every social media platform.

${CONNOR_CONTEXT}

You MUST output valid JSON with exactly these keys. No markdown, no code fences, just raw JSON.`;

        const userPrompt = `Here is the script from today's video:

"""
${script}
"""

YouTube URL: ${ytLink}
Show Type: ${showType || 'general'}

Generate ALL of the following as a JSON object. Each value should be a string ready to copy-paste:

{
  "youtubeTitle": "A clickbait title following MrBeast principles - curiosity gap, emotional trigger, under 60 chars. Generate the BEST one.",
  "youtubeTitleAlts": "3 alternative titles separated by newlines",
  "youtubeDescription": "Full YouTube description, MUST be under 5000 characters. Structure: hook paragraph, key topics with timestamps placeholder, Q&A section (conversational format with questions viewers might ask and answers from the script), SEO keywords section, links to all Connor's properties, subscribe CTA. Optimize for SEO, AEO (Answer Engine Optimization for AI assistants), AIEO (AI Engine Optimization), and GEO (Generative Engine Optimization). Include conversational Q&A pairs that AI assistants would surface. End with hashtags.",
  "youtubeHashtags": "30 relevant hashtags including branded ones (#ConnorWithHonor #CodedByConnor #HonorElevate). Mix trending + niche + branded.",
  "instagramCaption": "Instagram post with heavy emoji usage, line breaks for readability, numbered key points, strong CTA, 'link in bio' reference, mention watching full video at ${ytLink}, save/share CTAs, 30 hashtags at bottom. Make it SCROLL-STOPPING. Include 3 references to watch the full YouTube video.",
  "facebookPost": "Facebook post - conversational, story-driven, asks questions to drive comments, includes ${ytLink} prominently 3 times with different CTAs ('watch now', 'full breakdown here', 'don't miss this'), tag/share prompts, links to properties.",
  "linkedinPost": "LinkedIn post - professional but personal, thought-leadership angle, insight-driven, includes ${ytLink}, relevant to career/business growth, asks for engagement in comments.",
  "twitterPost": "X/Twitter post - under 280 chars, punchy hook, ${ytLink}, 3-4 hashtags. Make it retweetable.",
  "twitterThread": "X/Twitter thread - 5-7 tweets, each under 280 chars. First tweet is the hook. Last tweet links to ${ytLink} and properties. Number each tweet 1/ 2/ etc.",
  "tiktokCaption": "TikTok caption - short, trending, 'full video on YouTube' CTA, relevant hashtags including #fyp #foryou, under 300 chars.",
  "emailNewsletter": "Brief email newsletter version - subject line on first line, then body. Conversational, drives to ${ytLink}, includes property links."
}

CRITICAL: Output ONLY the JSON object. No explanation, no markdown fences.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 8192,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: userPrompt }
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ error: `Claude API error: ${response.status}`, details: errorData }),
            };
        }

        const data = await response.json();
        const rawText = data.content?.[0]?.text || '{}';

        // Parse the JSON response
        let content;
        try {
            // Try to extract JSON even if there's surrounding text
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            content = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
        } catch (parseErr) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    error: 'Failed to parse AI response as JSON',
                    rawResponse: rawText,
                }),
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                content,
                generatedAt: new Date().toISOString(),
                youtubeUrl: ytLink,
            }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
