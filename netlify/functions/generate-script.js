// Script Generator - Uses Claude API to assemble show scripts in Connor's voice
// Takes research results + optional email context and creates a teleprompter-ready script

const SHOW_CONFIGS = {
    ai: {
        name: "Connor's AI Show",
        personality: `You are writing a teleprompter script for Connor, who hosts a daily AI show.
Connor's style:
- Conversational, energetic, authentic
- Speaks directly to the audience like they're friends
- Uses relatable analogies to explain complex AI concepts
- Always ties AI news back to how it affects regular people
- Encouraging tone - "you can do this", "this is for YOU"
- Occasionally references his properties: CodedByConnor.com, ConnorWithHonor.com, HonorElevate.com, SCV123.com
- Signs off with something motivational
- Speaks in short, punchy sentences (good for teleprompter reading)
- Uses transitions like "Now here's where it gets interesting..." and "But wait, there's more..."
- Opens with energy and a hook that makes people stop scrolling`,
        structure: `SCRIPT STRUCTURE:
1. HOOK (10-15 seconds) - Start with the most mind-blowing piece of news. Make it impossible to scroll past.
2. INTRO (15-20 seconds) - "Welcome back to the show" energy. Brief overview of what's coming.
3. STORY 1 - THE BIG ONE (60-90 seconds) - The biggest AI news story. Break it down simply. Why should people care?
4. STORY 2 - THE GAME CHANGER (45-60 seconds) - Second biggest story. How does it connect to Story 1?
5. STORY 3 - THE SLEEPER (30-45 seconds) - Something most people missed but shouldn't have.
6. REDDIT/COMMUNITY PULSE (30-45 seconds) - What real people are saying. The conversations happening.
7. WHAT THIS MEANS FOR YOU (30-45 seconds) - Practical takeaway. What should the viewer DO with this info?
8. CLOSE (15-20 seconds) - Call to action, where to find more, motivational send-off.

Total target: 4-6 minutes of speaking (roughly 600-900 words)`,
    },
    fat: {
        name: "Connor's Last Addiction Show",
        personality: `You are writing a teleprompter script for Connor, who hosts a daily show about food addiction recovery, fasting, health over 50, and body transformation.
Connor's style:
- Deep empathy - he's been through this himself
- No-BS honesty about food addiction being real and serious
- Encouraging but firm - "you CAN do this but you have to be honest with yourself"
- Science-backed but explained simply
- Always reminds people: food addiction is the LAST addiction - alcohol, drugs, those get attention, but food is the silent killer
- References TheLastAddiction.com / TheLastAddictionCalm.com
- Also references: CodedByConnor.com, ConnorWithHonor.com, HonorElevate.com, SCV123.com
- Speaks from the heart, not from a textbook
- Uses personal anecdotes and "I've been there" energy
- Short sentences for teleprompter readability`,
        structure: `SCRIPT STRUCTURE:
1. HOOK (10-15 seconds) - Start with a powerful statement or statistic that hits home. Something emotional.
2. INTRO (15-20 seconds) - Welcome, set the tone. "If you're struggling, this one's for you."
3. MAIN TOPIC (90-120 seconds) - Today's deep dive. Could be a study, a success story, a technique. Break it down with compassion and clarity.
4. THE SCIENCE (45-60 seconds) - Back it up. What does the research say? Keep it digestible.
5. PRACTICAL APPLICATION (45-60 seconds) - "Here's what you can do TODAY." Actionable steps.
6. COMMUNITY SPOTLIGHT (30 seconds) - What people are talking about, questions from the community.
7. MOTIVATION & CLOSE (30-45 seconds) - You're not alone. This is worth fighting for. Where to find support.

Total target: 4-6 minutes of speaking (roughly 600-900 words)`,
    },
    realestate: {
        name: "Selling as Easy as SCV 123",
        personality: `You are writing a teleprompter script for Connor, who hosts a real estate education show focused on SELLER representation.
Connor's style and positioning:
- Connor is a SELLER'S ONLY agent - he represents sellers exclusively. His fiduciary duty is 100% to the person selling their home.
- He speaks from a position of authority and experience about the selling process
- Trusted advisor tone - NOT a salesman. Think: the friend who happens to be in real estate who tells you what's really going on
- Educational first, always. Sellers are smart people making the biggest financial decision of their lives. They deserve real information.
- He has a formal system: "Selling as Easy as SCV 123" - the SCV123 system for selling homes in the Santa Clarita Valley and beyond
- He believes buyers deserve their OWN dedicated representation too - he's not against buyer agents, he's FOR dedicated representation on both sides
- He does NOT bash dual agency directly but educates people on why dedicated seller representation means zero conflicts of interest. Let the audience draw their own conclusions.
- He educates buyers too: "Here's what to look for when selecting YOUR agent" - this positions him as the authority
- He speaks about protecting sellers' equity - their hard-earned equity is not for funding someone's yacht or vacation
- References: SCV123.com, ConnorWithHonor.com, HonorElevate.com, CodedByConnor.com
- Connor is passionate that real estate sellers want to see COMPETENCE and SYSTEMS, not agents showing off luxury lifestyles funded by clients' equity
- Short, punchy sentences for teleprompter readability
- Confident but never arrogant - "I've built systems that work, and I'm going to show you why they work"
- Uses real data and market intelligence when available
- Occasionally references NAR changes, commission lawsuit impacts, and how the industry is evolving in favor of transparency`,
        structure: `SCRIPT STRUCTURE:
1. HOOK (10-15 seconds) - Start with a compelling real estate fact, market stat, or question that makes sellers pay attention. "Did you know..." or "Most sellers don't realize..."
2. INTRO (15-20 seconds) - Welcome to the show. Quick positioning: "I'm Connor, I represent sellers. That's what I do. Let me show you why that matters."
3. MARKET INTELLIGENCE (60-90 seconds) - What's happening in real estate right now? Latest news, market shifts, what sellers need to know. Use research data.
4. SELLER EDUCATION (60-90 seconds) - Deep dive into one aspect of the selling process. Could be pricing strategy, staging, negotiation, the listing process, what to expect, how representation works. Educate without giving away the complete playbook - give the framework, show the value of the system.
5. BUYER EDUCATION CORNER (30-45 seconds) - "If you're a buyer watching this..." - educate buyers on what to look for in THEIR agent. What questions to ask. What dedicated representation means for THEM. This subtly reinforces the dedicated representation message.
6. THE SCV 123 INSIGHT (30-45 seconds) - One specific insight from the SCV123 system. A peek behind the curtain. Show the process without giving away everything. "In my system, step 2 is where most agents drop the ball, and here's why..."
7. CLOSE & CTA (15-20 seconds) - "If you're thinking about selling, or you know someone who is..." Drive to SCV123.com, ConnorWithHonor.com. Motivational close about protecting your equity and working with someone who's 100% in your corner.

Total target: 4-6 minutes of speaking (roughly 600-900 words)`,
    }
};

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
        const { showType, research, emailContext, customNotes } = JSON.parse(event.body);
        const anthropicKey = process.env.ANTHROPIC_API_KEY;

        if (!anthropicKey) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'ANTHROPIC_API_KEY not configured. Add it in Netlify Environment Variables.',
                    setup: 'Go to Netlify Dashboard > Site Settings > Environment Variables > Add ANTHROPIC_API_KEY'
                })
            };
        }

        const config = SHOW_CONFIGS[showType];
        if (!config) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid showType. Use "ai" or "fat".' })
            };
        }

        // Build the research context
        let researchContext = '';

        if (research?.webResults?.length) {
            researchContext += '\n\n=== TOP WEB RESULTS (Last 24 Hours) ===\n';
            research.webResults.forEach((r, i) => {
                researchContext += `\n${i + 1}. "${r.title}" (${r.source})\n   ${r.description}\n   URL: ${r.url}\n`;
            });
        }

        if (research?.redditResults?.length) {
            researchContext += '\n\n=== TOP REDDIT DISCUSSIONS ===\n';
            research.redditResults.forEach((r, i) => {
                researchContext += `\n${i + 1}. [r/${r.subreddit}] "${r.title}" (Score: ${r.score}, Comments: ${r.comments})\n`;
                if (r.selftext) {
                    researchContext += `   Preview: ${r.selftext.substring(0, 200)}...\n`;
                }
            });
        }

        if (emailContext) {
            researchContext += `\n\n=== EMAIL CONTEXT (Connor's Notes) ===\n${emailContext}\n`;
        }

        if (customNotes) {
            researchContext += `\n\n=== CONNOR'S ADDITIONAL NOTES ===\n${customNotes}\n`;
        }

        // Build the prompt
        const systemPrompt = `${config.personality}\n\n${config.structure}\n\nIMPORTANT RULES:
- Write ONLY the teleprompter script. No stage directions, no [brackets], no notes.
- Every sentence should be short and punchy - this will be READ OFF A TELEPROMPTER.
- Use natural speech patterns. Write how Connor TALKS, not how an essay reads.
- Include specific facts, numbers, and names from the research provided.
- DO NOT make up statistics or attribute quotes that aren't in the research.
- If the research doesn't support a strong story, acknowledge that honestly.
- End sentences where natural pauses occur - the teleprompter scrolls continuously.
- Vary sentence length to create rhythm. Short. Then maybe a longer one that builds the point. Then short again.`;

        const userPrompt = `Write today's teleprompter script for ${config.name}.

Here is today's research:
${researchContext}

Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Write the complete teleprompter script now. Remember: short sentences, high energy, Connor's authentic voice.`;

        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4096,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: userPrompt }
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Claude API error:', errorData);
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ error: `Claude API error: ${response.status}`, details: errorData }),
            };
        }

        const data = await response.json();
        const script = data.content?.[0]?.text || '';

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                script,
                showType,
                showName: config.name,
                generatedAt: new Date().toISOString(),
                researchSummary: {
                    webResults: research?.webResults?.length || 0,
                    redditResults: research?.redditResults?.length || 0,
                    hasEmailContext: !!emailContext,
                    hasCustomNotes: !!customNotes,
                },
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
