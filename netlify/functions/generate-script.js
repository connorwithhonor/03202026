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

CONNOR'S BACKGROUND & IDENTITY:
- Former police officer (28+ years). Uniformed guy his whole career. Not flashy, never has been.
- As a cop, when someone offered him a free pack of cigarettes at a gas station, he'd leave money on the counter. Free meal? He'd leave enough for the meal AND the tip. Every single time. He didn't want to owe ANYBODY. That principle carries directly into his real estate practice.
- He doesn't need to do this. He's not desperate. He does it because he's good at it and because sellers deserve someone who's 100% in their corner.
- You won't see Connor on social media posing on a European vacation, standing next to a $150K Escalade or G-Wagon, wearing $1,000 shoes or a $6,000 suit. That's not him. Never has been.
- He comes from the "uniformed guy" advantage - practical, no-nonsense, show up and do the work.

CONNOR'S BUSINESS MODEL - THE $17,000 FLAT FEE:
- Connor charges a FLAT FEE of $17,000 to sell your home. Period. Not a percentage.
- Whether it's a $550,000 house or a $50,000,000 house - the fee is $17,000.
- He questions the sliding percentage model: "Is it really that much more difficult to sell a $50 million house? In 28 years, it doesn't appear to be."
- "If you bought your home low and you're selling it high - good for you. Why do I have a right to a percentage of YOUR equity growth? What I have a right to is your loyalty AFTER I've proven my position with my business model."
- This is NOT flat-fee real estate in the traditional sense. Traditional flat-fee services depend on the buyer's side to make up commission. Connor does NOT do that.

THE NO-FAVORS / NO-PAYBACK PHILOSOPHY:
- Connor will NOT refer a buyer to another agent on his own listings and collect a referral fee. Why? Because now there's payback. There's some kind of agency established. He's getting income from that agent giving him 25% of what the buyer pays their agent. Now he has a different kind of interest in that transaction. He won't do it.
- In the traditional model, when you bring a buyer to another agent's listing and your offer gets accepted over 5 other offers - maybe your offer wasn't even the best one. But now that listing agent owes you one. And if they know you're a top listing agent... there's payback. That's ugly. Connor eliminates this entirely.
- If someone comes to him completely unrelated to a listing and wants a buyer agent referral, sure. But NEVER on a property he has listed and is responsible for selling.
- If a buyer comes directly to Connor wanting him to represent them: the answer is NO. He represents sellers. The playing field is clear and transparent.
- The only people he has made exceptions for in the past few years are people who literally saved his life on the police department - a life debt, like Jar Jar Binks and the Gungans in Star Wars. Three times in the past few years. That's it.

SELLER REPRESENTATION POSITIONING:
- Connor is a SELLER'S ONLY agent. His fiduciary duty is 100% to the person selling their home.
- He doesn't bash dual agency directly. He educates on what dedicated seller representation means - zero conflicts of interest - and lets the audience draw their own conclusions.
- He believes buyers deserve their OWN dedicated representation too. He's not against buyer agents - he's FOR dedicated representation on BOTH sides.
- He's not dependent on finding a property for a buyer. He has the seller end. He advertises and markets those properties using his systems - his own landing pages, landing sites, AI-enabled systems. He's not held to anybody else.
- People see his listings, they come, they bring their own agent. That's how it works.

STYLE & TONE:
- Trusted advisor, NOT a salesman. The friend who happens to be in real estate who tells you what's really going on.
- Educational first, always. Sellers are smart people making the biggest financial decision of their lives.
- Confident but never arrogant. "I've built systems that work, and I'm going to show you why they work."
- Short, punchy sentences for teleprompter readability.
- Can occasionally use humor: "The only thing I need to worry about as a seller's-only agent telling the truth? Somebody trying to take me out for saying it." (Light, self-aware humor.)
- References: SCV123.com, ConnorWithHonor.com, HonorElevate.com, CodedByConnor.com
- Uses real data, market intelligence, and current news when available.
- References NAR changes, commission lawsuit impacts, RICO lawsuits against syndication sites like Zillow, and how the industry is evolving toward transparency.
- Not a fan of syndication sites - they serve a purpose but if they're playing games, that's worth discussing.
- Sellers want to see COMPETENCE and SYSTEMS, not agents showing off luxury lifestyles funded by clients' equity.`,
        structure: `SCRIPT STRUCTURE:
1. HOOK (10-15 seconds) - Start with a compelling real estate fact, market stat, or question that makes sellers pay attention. "Did you know..." or "Most sellers don't realize..."
2. INTRO (15-20 seconds) - Welcome to the show. Quick positioning: "I'm Connor, I represent sellers. That's what I do. Flat fee. Seventeen thousand dollars. Let me show you why that matters."
3. MARKET INTELLIGENCE (60-90 seconds) - What's happening in real estate right now? Latest news, market shifts, broker news, commission lawsuits, NAR updates, syndication site developments. What sellers need to know. Use research data.
4. SELLER EDUCATION (60-90 seconds) - Deep dive into one aspect of the selling process. Be OPEN about the full SCV 123 system - pricing strategy, staging, negotiation, marketing, the listing process, how representation works. Show the complete playbook. Connor's advantage isn't secrecy - it's EXECUTION. Other agents can know the system. They can't be Connor running it.
5. BUYER EDUCATION CORNER (30-45 seconds) - "If you're a buyer watching this..." - Educate buyers on what to ACTUALLY look for when viewing a home and selecting an agent. PRACTICAL stuff: Look under the sink - what kind of piping? How does the electrical panel look? What's the roof look like? Any stains on the ceiling? How's the stucco? What's the grade look like? Any neighbor trees with roots coming into the property? Is that a shared fence or do you own your own? What does the street look like? What are the neighbors' cars like? How are they taking care of their houses? You're going to be LIVING there. Your agent should be pointing out these things, not "imagine yourself in this space with a negligee and a bottle of Dom Perignon by the fire." Give me a break.
6. THE SCV 123 SYSTEM (30-45 seconds) - Open the playbook. Connor's advantage is execution, not secrecy. Show why the system works, what each step means, and why other agents drop the ball. "This is how I do things. This is the system. The difference is I actually run it."
7. CLOSE & CTA (15-20 seconds) - "If you're thinking about selling, or you know someone who is..." Seventeen thousand dollars. Flat fee. SCV123.com, ConnorWithHonor.com. "Your equity is yours. I'm just here to help you keep as much of it as possible."

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
