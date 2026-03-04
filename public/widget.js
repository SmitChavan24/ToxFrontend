/**
 * HelpWave Chat Widget
 * 
 * Embed this on any website to add customer support chat.
 * 
 * Usage:
 *   <script src="https://your-helpwave-domain.com/widget.js" 
 *           data-helpwave-url="https://your-helpwave-domain.com">
 *   </script>
 * 
 * That's it! A chat bubble will appear in the bottom-right corner.
 */
(function () {
    'use strict';

    // Get the script tag to read config
    const scriptTag = document.currentScript || document.querySelector('script[data-helpwave-url]');
    const baseUrl = scriptTag?.getAttribute('data-helpwave-url') || window.location.origin;
    const position = scriptTag?.getAttribute('data-position') || 'right'; // 'left' or 'right'
    const color = scriptTag?.getAttribute('data-color') || '#6366f1'; // indigo-500

    // Prevent double-initialization
    if (window.__helpwave_loaded) return;
    window.__helpwave_loaded = true;

    // ── Styles ──
    const style = document.createElement('style');
    style.textContent = `
        #helpwave-widget-bubble {
            position: fixed;
            bottom: 24px;
            ${position === 'left' ? 'left: 24px;' : 'right: 24px;'}
            z-index: 99999;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${color}, #8b5cf6);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 24px rgba(99, 102, 241, 0.35), 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            outline: none;
        }
        #helpwave-widget-bubble:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 32px rgba(99, 102, 241, 0.45), 0 4px 12px rgba(0,0,0,0.15);
        }
        #helpwave-widget-bubble:active {
            transform: scale(0.95);
        }
        #helpwave-widget-bubble svg {
            width: 28px;
            height: 28px;
            fill: none;
            stroke: white;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        #helpwave-widget-bubble .hw-badge {
            position: absolute;
            top: -2px;
            right: -2px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #ef4444;
            border: 2px solid white;
            display: none;
        }
        #helpwave-widget-frame-container {
            position: fixed;
            bottom: 96px;
            ${position === 'left' ? 'left: 24px;' : 'right: 24px;'}
            z-index: 99998;
            width: 380px;
            height: 560px;
            max-height: calc(100vh - 120px);
            max-width: calc(100vw - 48px);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 48px rgba(0,0,0,0.15), 0 2px 16px rgba(99,102,241,0.15);
            opacity: 0;
            transform: translateY(16px) scale(0.95);
            transition: opacity 0.3s ease, transform 0.3s ease;
            pointer-events: none;
            border: 1px solid rgba(0,0,0,0.08);
        }
        #helpwave-widget-frame-container.hw-open {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }
        #helpwave-widget-frame-container iframe {
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 16px;
        }

        /* Mobile responsive */
        @media (max-width: 480px) {
            #helpwave-widget-frame-container {
                width: 100vw;
                height: 100vh;
                max-height: 100vh;
                max-width: 100vw;
                bottom: 0;
                left: 0;
                right: 0;
                border-radius: 0;
            }
            #helpwave-widget-frame-container iframe {
                border-radius: 0;
            }
            #helpwave-widget-frame-container.hw-open ~ #helpwave-widget-bubble {
                display: none;
            }
        }

        /* Pulse animation on load */
        @keyframes hw-pulse {
            0%, 100% { box-shadow: 0 4px 24px rgba(99, 102, 241, 0.35); }
            50% { box-shadow: 0 4px 32px rgba(99, 102, 241, 0.55); }
        }
        #helpwave-widget-bubble.hw-pulse {
            animation: hw-pulse 2s ease-in-out 3;
        }
    `;
    document.head.appendChild(style);

    // ── Chat Bubble ──
    const bubble = document.createElement('button');
    bubble.id = 'helpwave-widget-bubble';
    bubble.className = 'hw-pulse';
    bubble.setAttribute('aria-label', 'Open support chat');
    bubble.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <span class="hw-badge"></span>
    `;
    document.body.appendChild(bubble);

    // ── Chat Frame Container ──
    const frameContainer = document.createElement('div');
    frameContainer.id = 'helpwave-widget-frame-container';
    document.body.appendChild(frameContainer);

    // ── State ──
    let isOpen = false;
    let iframeLoaded = false;

    // ── Toggle ──
    bubble.addEventListener('click', function () {
        isOpen = !isOpen;

        if (isOpen) {
            // Load iframe on first open (lazy load)
            if (!iframeLoaded) {
                const iframe = document.createElement('iframe');
                iframe.src = baseUrl + '/support/chat?widget=true';
                iframe.title = 'HelpWave Support Chat';
                iframe.allow = 'microphone; camera';
                frameContainer.appendChild(iframe);
                iframeLoaded = true;
            }
            frameContainer.classList.add('hw-open');
            bubble.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            `;
        } else {
            frameContainer.classList.remove('hw-open');
            bubble.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
            `;
        }
    });

    // ── Listen for close message from iframe ──
    window.addEventListener('message', function (e) {
        if (e.data === 'helpwave-close') {
            isOpen = false;
            frameContainer.classList.remove('hw-open');
            bubble.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
            `;
        }
    });
})();
