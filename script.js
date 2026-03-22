/* ============================================
   CONNOR'S TELEPROMPTER - APP ENGINE
   ============================================ */

(function() {
    'use strict';

    // ==========================================
    // STATE
    // ==========================================
    const state = {
        currentScreen: 'menuScreen',
        script: '',
        scrollSpeed: 2.5,
        fontSize: 36,
        textOpacity: 0.85,
        mirrorText: false,
        showCamera: true,
        isScrolling: false,
        isPaused: false,
        scrollPosition: 0,
        animationId: null,
        cameraStream: null,
        touchStartY: 0,
        scrollAtTouchStart: 0,
        uploadedImageData: null,
        youtubeUrl: '',
    };

    // Connor's properties for content generation
    const CONNOR_PROPERTIES = {
        websites: [
            { name: 'CodedByConnor.com', url: 'https://codedbyconnor.com' },
            { name: 'ConnorWithHonor.com', url: 'https://connorwithhonor.com' },
            { name: 'HonorElevate.com', url: 'https://honorelevate.com' },
            { name: 'SCV123.com', url: 'https://scv123.com' },
        ],
        socials: {
            youtube: 'Connor With Honor',
            instagram: '@connorwithhonor',
        }
    };

    // ==========================================
    // DOM REFERENCES
    // ==========================================
    const $ = id => document.getElementById(id);
    const screens = {
        menu: $('menuScreen'),
        script: $('scriptScreen'),
        teleprompter: $('teleprompterScreen'),
        content: $('contentScreen'),
        image: $('imageScreen'),
    };

    // ==========================================
    // NAVIGATION
    // ==========================================
    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = $(screenId);
        if (target) {
            target.classList.add('active');
            state.currentScreen = screenId;
        }
    }

    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (state.currentScreen === 'teleprompterScreen') {
                stopTeleprompter();
            }
            showScreen(btn.dataset.target);
        });
    });

    // Menu buttons
    $('btnNewScript').addEventListener('click', () => showScreen('scriptScreen'));
    $('btnContentStudio').addEventListener('click', () => showScreen('contentScreen'));
    $('btnImageStudio').addEventListener('click', () => showScreen('imageScreen'));

    // ==========================================
    // SCRIPT ENTRY CONTROLS
    // ==========================================
    const speedSlider = $('speedSlider');
    const fontSlider = $('fontSlider');
    const opacitySlider = $('opacitySlider');
    const mirrorToggle = $('mirrorToggle');
    const cameraToggle = $('cameraToggle');

    speedSlider.addEventListener('input', () => {
        state.scrollSpeed = parseFloat(speedSlider.value);
        $('speedValue').textContent = state.scrollSpeed;
    });

    fontSlider.addEventListener('input', () => {
        state.fontSize = parseInt(fontSlider.value);
        $('fontValue').textContent = state.fontSize + 'px';
    });

    opacitySlider.addEventListener('input', () => {
        state.textOpacity = parseFloat(opacitySlider.value);
        $('opacityValue').textContent = Math.round(state.textOpacity * 100) + '%';
    });

    // ==========================================
    // TELEPROMPTER ENGINE
    // ==========================================
    $('btnStartTeleprompter').addEventListener('click', startTeleprompter);

    async function startTeleprompter() {
        const scriptText = $('scriptText').value.trim();
        if (!scriptText) {
            $('scriptText').focus();
            $('scriptText').style.borderColor = 'var(--danger)';
            setTimeout(() => $('scriptText').style.borderColor = '', 1500);
            return;
        }

        state.script = scriptText;
        state.mirrorText = mirrorToggle.checked;
        state.showCamera = cameraToggle.checked;

        // Prepare the prompter content
        const content = $('prompterContent');
        content.innerHTML = '';

        // Split text into paragraphs for readability
        const paragraphs = scriptText.split(/\n\n|\n/).filter(p => p.trim());
        paragraphs.forEach(p => {
            const el = document.createElement('p');
            el.textContent = p.trim();
            el.style.fontSize = state.fontSize + 'px';
            el.style.opacity = state.textOpacity;
            content.appendChild(el);
        });

        if (state.mirrorText) {
            content.classList.add('mirrored');
        } else {
            content.classList.remove('mirrored');
        }

        // Setup camera
        const cameraFeed = $('cameraFeed');
        const overlay = document.querySelector('.camera-overlay');
        if (state.showCamera) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false
                });
                cameraFeed.srcObject = stream;
                state.cameraStream = stream;
                cameraFeed.style.display = 'block';
                overlay.style.display = 'block';
            } catch (err) {
                console.warn('Camera not available:', err);
                cameraFeed.style.display = 'none';
                overlay.style.background = 'rgba(10, 10, 26, 0.95)';
            }
        } else {
            cameraFeed.style.display = 'none';
            overlay.style.background = 'rgba(10, 10, 26, 0.95)';
        }

        // Show teleprompter screen
        showScreen('teleprompterScreen');

        // Reset position
        state.scrollPosition = 0;
        content.style.transform = `translateY(0px)`;
        $('progressFill').style.width = '0%';
        $('liveSpeed').textContent = state.scrollSpeed + 'x';

        // Start countdown
        startCountdown();
    }

    function startCountdown() {
        const overlay = $('countdownOverlay');
        const number = $('countdownNumber');
        overlay.classList.remove('hidden');

        let count = 3;
        number.textContent = count;

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                number.textContent = count;
            } else {
                clearInterval(interval);
                overlay.classList.add('hidden');
                beginScrolling();
            }
        }, 1000);
    }

    function beginScrolling() {
        state.isScrolling = true;
        state.isPaused = false;
        $('statusScrolling').style.display = 'block';
        $('statusPaused').style.display = 'none';

        // Hide status after 2 seconds
        setTimeout(() => {
            if (state.isScrolling && !state.isPaused) {
                $('statusScrolling').style.display = 'none';
            }
        }, 2000);

        scrollLoop();
    }

    function scrollLoop() {
        if (!state.isScrolling) return;

        if (!state.isPaused) {
            state.scrollPosition += state.scrollSpeed * 0.6;

            const content = $('prompterContent');
            content.style.transform = `translateY(-${state.scrollPosition}px)`;

            // Update progress
            const totalHeight = content.scrollHeight;
            const viewHeight = window.innerHeight;
            const maxScroll = totalHeight;
            const progress = Math.min((state.scrollPosition / maxScroll) * 100, 100);
            $('progressFill').style.width = progress + '%';

            // Check if we've reached the end
            if (state.scrollPosition >= totalHeight) {
                stopScrolling();
                return;
            }
        }

        state.animationId = requestAnimationFrame(scrollLoop);
    }

    function stopScrolling() {
        state.isScrolling = false;
        if (state.animationId) {
            cancelAnimationFrame(state.animationId);
            state.animationId = null;
        }
        $('statusScrolling').style.display = 'none';
        $('statusPaused').style.display = 'none';
    }

    function stopTeleprompter() {
        stopScrolling();
        if (state.cameraStream) {
            state.cameraStream.getTracks().forEach(t => t.stop());
            state.cameraStream = null;
        }
        $('cameraFeed').srcObject = null;
    }

    // ==========================================
    // TELEPROMPTER TOUCH CONTROLS
    // ==========================================
    const prompterArea = $('prompterArea');

    // Touch start = pause and allow drag
    prompterArea.addEventListener('touchstart', (e) => {
        if (!state.isScrolling) return;

        state.isPaused = true;
        state.touchStartY = e.touches[0].clientY;
        state.scrollAtTouchStart = state.scrollPosition;
        $('statusPaused').style.display = 'block';
        $('statusScrolling').style.display = 'none';
    }, { passive: true });

    // Touch move = drag text position
    prompterArea.addEventListener('touchmove', (e) => {
        if (!state.isScrolling || !state.isPaused) return;

        const deltaY = state.touchStartY - e.touches[0].clientY;
        state.scrollPosition = Math.max(0, state.scrollAtTouchStart + deltaY);
        $('prompterContent').style.transform = `translateY(-${state.scrollPosition}px)`;
    }, { passive: true });

    // Touch end = resume scrolling
    prompterArea.addEventListener('touchend', () => {
        if (!state.isScrolling) return;

        state.isPaused = false;
        $('statusPaused').style.display = 'none';
        $('statusScrolling').style.display = 'block';

        setTimeout(() => {
            if (state.isScrolling && !state.isPaused) {
                $('statusScrolling').style.display = 'none';
            }
        }, 1500);
    }, { passive: true });

    // Mouse events for desktop testing
    prompterArea.addEventListener('mousedown', (e) => {
        if (!state.isScrolling) return;
        state.isPaused = true;
        state.touchStartY = e.clientY;
        state.scrollAtTouchStart = state.scrollPosition;
        $('statusPaused').style.display = 'block';
        $('statusScrolling').style.display = 'none';
    });

    prompterArea.addEventListener('mousemove', (e) => {
        if (!state.isScrolling || !state.isPaused) return;
        const deltaY = state.touchStartY - e.clientY;
        state.scrollPosition = Math.max(0, state.scrollAtTouchStart + deltaY);
        $('prompterContent').style.transform = `translateY(-${state.scrollPosition}px)`;
    });

    prompterArea.addEventListener('mouseup', () => {
        if (!state.isScrolling) return;
        state.isPaused = false;
        $('statusPaused').style.display = 'none';
    });

    // ==========================================
    // TELEPROMPTER CONTROL BAR
    // ==========================================
    $('btnRestart').addEventListener('click', (e) => {
        e.stopPropagation();
        state.scrollPosition = 0;
        $('prompterContent').style.transform = 'translateY(0px)';
        $('progressFill').style.width = '0%';
        if (!state.isScrolling) {
            beginScrolling();
        }
    });

    $('btnSlower').addEventListener('click', (e) => {
        e.stopPropagation();
        state.scrollSpeed = Math.max(0.5, state.scrollSpeed - 0.5);
        $('liveSpeed').textContent = state.scrollSpeed + 'x';
        speedSlider.value = state.scrollSpeed;
        $('speedValue').textContent = state.scrollSpeed;
    });

    $('btnFaster').addEventListener('click', (e) => {
        e.stopPropagation();
        state.scrollSpeed = Math.min(8, state.scrollSpeed + 0.5);
        $('liveSpeed').textContent = state.scrollSpeed + 'x';
        speedSlider.value = state.scrollSpeed;
        $('speedValue').textContent = state.scrollSpeed;
    });

    $('btnExit').addEventListener('click', (e) => {
        e.stopPropagation();
        stopTeleprompter();
        showScreen('scriptScreen');
    });

    // Double-tap to toggle control bar visibility
    let lastTap = 0;
    $('teleprompterScreen').addEventListener('click', (e) => {
        const now = Date.now();
        if (now - lastTap < 300) {
            const bar = $('controlBar');
            bar.classList.toggle('hidden');
        }
        lastTap = now;
    });

    // ==========================================
    // CONTENT STUDIO - GENERATION ENGINE
    // ==========================================
    $('btnUsePrompterScript').addEventListener('click', () => {
        const script = $('scriptText').value.trim();
        if (script) {
            $('contentScript').value = script;
        }
    });

    // Generate content buttons
    document.querySelectorAll('.gen-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const script = $('contentScript').value.trim();

            if (!script) {
                $('contentScript').focus();
                return;
            }

            state.youtubeUrl = $('youtubeUrl').value.trim();

            if (type === 'all') {
                generateAllContent(script);
            } else {
                generateContent(type, script);
            }
        });
    });

    function generateAllContent(script) {
        const types = ['youtube-title', 'youtube-desc', 'youtube-hashtags', 'instagram', 'facebook', 'linkedin', 'twitter', 'tiktok'];
        const outputSection = $('outputSection');
        const output = $('contentOutput');
        output.innerHTML = '';

        types.forEach(type => {
            const content = buildContent(type, script);
            output.appendChild(createOutputCard(type, content));
        });

        outputSection.style.display = 'block';
        outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    function generateContent(type, script) {
        const outputSection = $('outputSection');
        const output = $('contentOutput');
        output.innerHTML = '';

        const content = buildContent(type, script);
        output.appendChild(createOutputCard(type, content));

        outputSection.style.display = 'block';
        outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    function createOutputCard(type, content) {
        const card = document.createElement('div');
        card.className = 'output-card';

        const typeNames = {
            'youtube-title': 'YouTube Title',
            'youtube-desc': 'YouTube Description',
            'youtube-hashtags': 'YouTube Hashtags',
            'instagram': 'Instagram Post',
            'facebook': 'Facebook Post',
            'linkedin': 'LinkedIn Post',
            'twitter': 'X/Twitter Post',
            'tiktok': 'TikTok Caption',
        };

        card.innerHTML = `
            <div class="output-card-header">
                <h4>${typeNames[type] || type}</h4>
                <button class="copy-small-btn" data-copy>Copy</button>
            </div>
            <div class="output-card-body">${escapeHtml(content)}</div>
        `;

        card.querySelector('[data-copy]').addEventListener('click', () => {
            navigator.clipboard.writeText(content).then(() => {
                const btn = card.querySelector('[data-copy]');
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy', 1500);
            });
        });

        return card;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ==========================================
    // CONTENT BUILDER - SEO/AEO/AIEO/GEO
    // ==========================================
    function extractKeyTopics(script) {
        // Pull first ~30 words as a summary
        const words = script.split(/\s+/);
        const summary = words.slice(0, 30).join(' ');
        // Get the first sentence as the hook
        const firstSentence = script.split(/[.!?]/)[0].trim();
        return { summary, firstSentence, wordCount: words.length };
    }

    function getYoutubeLink() {
        return state.youtubeUrl || '[YOUR YOUTUBE LINK]';
    }

    function getPropertyLinks() {
        return CONNOR_PROPERTIES.websites
            .map(w => `${w.name}: ${w.url}`)
            .join('\n');
    }

    function buildContent(type, script) {
        const { summary, firstSentence, wordCount } = extractKeyTopics(script);
        const ytLink = getYoutubeLink();

        switch(type) {
            case 'youtube-title':
                return buildYouTubeTitle(script, firstSentence);

            case 'youtube-desc':
                return buildYouTubeDesc(script, summary, ytLink);

            case 'youtube-hashtags':
                return buildYouTubeHashtags(script);

            case 'instagram':
                return buildInstagram(script, summary, ytLink);

            case 'facebook':
                return buildFacebook(script, summary, ytLink);

            case 'linkedin':
                return buildLinkedIn(script, summary, ytLink);

            case 'twitter':
                return buildTwitter(script, firstSentence, ytLink);

            case 'tiktok':
                return buildTikTok(script, firstSentence, ytLink);

            default:
                return script;
        }
    }

    function buildYouTubeTitle(script, firstSentence) {
        // Create clickbait-style title from content
        const hook = firstSentence.length > 60
            ? firstSentence.substring(0, 57) + '...'
            : firstSentence;

        return `${hook.toUpperCase()} (You NEED to See This!)

---
ALTERNATIVE TITLES (pick your favorite):

1. I Can't Believe This Actually Works... ${firstSentence.split(' ').slice(0, 5).join(' ')}
2. The ${firstSentence.split(' ').slice(0, 4).join(' ')} Nobody Talks About
3. STOP Doing This Wrong! ${firstSentence.split(' ').slice(0, 6).join(' ')}
4. This Changed Everything... ${firstSentence.split(' ').slice(0, 5).join(' ')}
5. ${firstSentence.split(' ').slice(0, 8).join(' ')} (GAME CHANGER)`;
    }

    function buildYouTubeDesc(script, summary, ytLink) {
        const lines = script.split(/[.!?]/).filter(s => s.trim()).slice(0, 8);
        const qaSection = lines.slice(0, 4).map((line, i) => {
            const q = line.trim();
            return `Q: What about ${q.split(' ').slice(0, 6).join(' ')}?\nA: ${q.trim()}.`;
        }).join('\n\n');

        return `${summary}...

In this video, I break down everything you need to know. Whether you're just getting started or looking to level up, this is the video for you.

WATCH THE FULL VIDEO HERE: ${ytLink}

================================
KEY TOPICS COVERED:
================================
${lines.slice(0, 6).map((l, i) => `${i + 1}. ${l.trim()}`).join('\n')}

================================
Q&A - YOUR QUESTIONS ANSWERED:
================================
${qaSection}

================================
CONNECT WITH ME:
================================
${CONNOR_PROPERTIES.websites.map(w => `${w.name} - ${w.url}`).join('\n')}

================================
ABOUT:
================================
I create content to help you succeed. Subscribe and hit the bell so you never miss a video!

SUBSCRIBE: ${ytLink}

#ConnorWithHonor #Success #Growth #Education #Motivation

---
SEO Keywords: ${script.split(/\s+/).filter(w => w.length > 4).slice(0, 15).join(', ')}`;
    }

    function buildYouTubeHashtags(script) {
        const words = script.split(/\s+/)
            .map(w => w.replace(/[^a-zA-Z0-9]/g, ''))
            .filter(w => w.length > 4);
        const unique = [...new Set(words)].slice(0, 12);

        const hashtags = unique.map(w => `#${w}`);
        hashtags.push('#ConnorWithHonor', '#CodedByConnor', '#HonorElevate', '#Success', '#Growth', '#Motivation', '#Entrepreneur', '#ContentCreator', '#YouTube');

        return hashtags.join(' ');
    }

    function buildInstagram(script, summary, ytLink) {
        const sentences = script.split(/[.!?]/).filter(s => s.trim()).slice(0, 5);

        return `\u{1F525}\u{1F525}\u{1F525} STOP SCROLLING! This is for YOU! \u{1F525}\u{1F525}\u{1F525}

${summary}...

\u{1F4A1} Here's what you need to know:

${sentences.map((s, i) => `${['1\uFE0F\u20E3','2\uFE0F\u20E3','3\uFE0F\u20E3','4\uFE0F\u20E3','5\uFE0F\u20E3'][i] || '\u2705'} ${s.trim()}`).join('\n')}

\u{1F3AC} Watch the FULL breakdown on YouTube!
\u{1F517} Link in bio OR: ${ytLink}

\u{1F4AC} Drop a \u{1F525} in the comments if this helped you!
\u{1F504} Share this with someone who needs to see it!
\u{1F516} Save for later - you'll thank yourself!

\u{2014}\u{2014}\u{2014}\u{2014}\u{2014}\u{2014}\u{2014}\u{2014}\u{2014}\u{2014}
\u{1F310} ${CONNOR_PROPERTIES.websites.map(w => w.url).join('\n\u{1F310} ')}
\u{2014}\u{2014}\u{2014}\u{2014}\u{2014}\u{2014}\u{2014}\u{2014}\u{2014}\u{2014}

#ConnorWithHonor #CodedByConnor #HonorElevate #Motivation #Success #Growth #Entrepreneur #ContentCreator #Inspiration #NeverGiveUp #GoalSetter #HustleHard #DreamBig #TakeAction #LevelUp #MindsetMatters #WinnerMindset #GrindMode #BossUp #MakeItHappen`;
    }

    function buildFacebook(script, summary, ytLink) {
        const sentences = script.split(/[.!?]/).filter(s => s.trim()).slice(0, 4);

        return `${summary}...

I just dropped a new video breaking all of this down! If you've been struggling with this, you're going to want to watch the full thing.

Here's a quick preview of what I cover:

${sentences.map(s => `\u2022 ${s.trim()}`).join('\n')}

\u{1F3AC} WATCH THE FULL VIDEO: ${ytLink}

The information in this video could genuinely change how you approach this. Don't sleep on it.

\u{1F449} Like & Share if this resonates with you!
\u{1F449} Tag someone who needs to see this!

${CONNOR_PROPERTIES.websites.map(w => `\u{1F517} ${w.url}`).join('\n')}`;
    }

    function buildLinkedIn(script, summary, ytLink) {
        const sentences = script.split(/[.!?]/).filter(s => s.trim()).slice(0, 5);

        return `${sentences[0] ? sentences[0].trim() + '.' : summary}

That's what I break down in my latest video.

Here's what you'll learn:

${sentences.slice(1, 5).map(s => `\u2192 ${s.trim()}`).join('\n')}

Whether you're a seasoned professional or just starting out, the insights in this video will give you a competitive edge.

\u{1F3AC} Watch the full breakdown: ${ytLink}

What are your thoughts on this? Drop them in the comments below.

---
${CONNOR_PROPERTIES.websites.map(w => w.url).join(' | ')}

#ProfessionalDevelopment #Growth #Innovation #Leadership #ConnorWithHonor #Success`;
    }

    function buildTwitter(script, firstSentence, ytLink) {
        const hook = firstSentence.length > 120
            ? firstSentence.substring(0, 117) + '...'
            : firstSentence;

        return `${hook}

I just broke this down in a new video. \u{1F447}

${ytLink}

\u{1F504} RT to help someone who needs this!

#ConnorWithHonor`;
    }

    function buildTikTok(script, firstSentence, ytLink) {
        return `${firstSentence} \u{1F525}

Full breakdown on YouTube \u{1F449} ${ytLink}

Follow for more! \u{1F4AA}

#fyp #foryou #viral #connorwithhonor #learnontiktok #motivation #success #tips #growth #entrepreneur`;
    }

    // ==========================================
    // THUMBNAIL STUDIO
    // ==========================================
    const uploadZone = $('uploadZone');
    const imageUpload = $('imageUpload');

    uploadZone.addEventListener('click', () => imageUpload.click());

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            state.uploadedImageData = ev.target.result;
            const img = $('uploadedImage');
            img.src = ev.target.result;
            img.style.display = 'block';
            $('uploadPlaceholder').style.display = 'none';
        };
        reader.readAsDataURL(file);
    });

    $('btnUseTitleFromScript').addEventListener('click', () => {
        const script = $('scriptText').value.trim() || $('contentScript').value.trim();
        if (script) {
            const firstLine = script.split(/[.!?\n]/)[0].trim();
            $('thumbTitle').value = firstLine.substring(0, 60);
        }
    });

    $('btnGenerateThumbs').addEventListener('click', generateThumbnails);

    function generateThumbnails() {
        const title = $('thumbTitle').value.trim() || 'YOUR TITLE HERE';

        if (!state.uploadedImageData) {
            // Generate with solid background
            renderThumbnail('canvasYT', 1280, 720, title, null);
            renderThumbnail('canvasFB', 851, 315, title, null);
            renderThumbnail('canvasIG', 1080, 1080, title, null);
            generateAiPrompt(title);
            return;
        }

        const img = new Image();
        img.onload = () => {
            renderThumbnail('canvasYT', 1280, 720, title, img);
            renderThumbnail('canvasFB', 851, 315, title, img);
            renderThumbnail('canvasIG', 1080, 1080, title, img);
            generateAiPrompt(title);
        };
        img.src = state.uploadedImageData;
    }

    function renderThumbnail(canvasId, width, height, title, img) {
        const canvas = $(canvasId);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Background
        if (img) {
            // Cover-fit the image
            const scale = Math.max(width / img.width, height / img.height);
            const x = (width - img.width * scale) / 2;
            const y = (height - img.height * scale) / 2;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            // Dark overlay for text readability
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(0,0,0,0.1)');
            gradient.addColorStop(0.5, 'rgba(0,0,0,0.3)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        } else {
            // Gradient background
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#6C5CE7');
            gradient.addColorStop(1, '#00D2FF');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        // Mr. Beast style title - bold, with outline
        const fontSize = Math.min(width * 0.08, height * 0.2);
        ctx.font = `900 ${fontSize}px Inter, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Text positioning
        const textY = img ? height * 0.75 : height * 0.5;
        const maxWidth = width * 0.85;

        // Word wrap
        const words = title.toUpperCase().split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            if (ctx.measureText(testLine).width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine);

        // Draw each line with stroke + fill (Mr. Beast style)
        const lineHeight = fontSize * 1.15;
        const startY = textY - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, i) => {
            const y = startY + i * lineHeight;

            // Black outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = fontSize * 0.12;
            ctx.lineJoin = 'round';
            ctx.strokeText(line, width / 2, y);

            // White fill
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(line, width / 2, y);

            // Yellow accent shadow
            ctx.fillStyle = 'rgba(255, 214, 0, 0.3)';
            ctx.fillText(line, width / 2 + 2, y + 3);
        });

        // Subtle border
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, width - 4, height - 4);
    }

    function generateAiPrompt(title) {
        const prompt = `Create a YouTube thumbnail image in the style of MrBeast/top YouTubers.

SUBJECT: "${title}"

REQUIREMENTS:
- Ultra high quality, photorealistic
- Person (Connor) looking amazed/excited with mouth open, expressive face
- Bold, large white text with black outline saying "${title.toUpperCase()}"
- Bright, high-contrast colors (use yellow, red, blue accents)
- Clean background that's not distracting
- Minimal clutter - the face and text should be the focus
- Add dramatic lighting effects
- Arrow or circle pointing to key element
- Make it look like it would get 10 million clicks

SIZES NEEDED:
1. 1280x720 (YouTube 16:9)
2. 851x315 (Facebook Cover)
3. 1080x1080 (Instagram Square)

Style: Professional, eye-catching, high CTR thumbnail`;

        $('aiPromptOutput').textContent = prompt;
        $('aiPromptOutput').classList.remove('placeholder-text');
        $('btnCopyAiPrompt').style.display = 'block';
    }

    $('btnCopyAiPrompt').addEventListener('click', () => {
        const text = $('aiPromptOutput').textContent;
        navigator.clipboard.writeText(text).then(() => {
            $('btnCopyAiPrompt').textContent = 'Copied!';
            setTimeout(() => $('btnCopyAiPrompt').textContent = 'Copy AI Prompt', 1500);
        });
    });

    // Download buttons
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const canvasId = btn.dataset.canvas;
            const name = btn.dataset.name;
            const canvas = $(canvasId);

            const link = document.createElement('a');
            link.download = `${name}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

    // ==========================================
    // PREVENT iOS BOUNCE/ZOOM
    // ==========================================
    document.addEventListener('gesturestart', e => e.preventDefault());

    // ==========================================
    // SERVICE WORKER REGISTRATION (PWA)
    // ==========================================
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }

})();
