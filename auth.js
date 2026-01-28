// Simple client-side authentication for TipsyDrive documentation
// Note: This prevents casual access only - not cryptographically secure

(function() {
    'use strict';

    // Skip auth in iframes (parent page handles it)
    if (window.self !== window.top) {
        return;
    }

    // Immediately inject styles to hide content until auth check completes
    var hideStyle = document.createElement('style');
    hideStyle.id = 'auth-hide-content';
    hideStyle.textContent = 'body { opacity: 0 !important; }';
    (document.head || document.documentElement).appendChild(hideStyle);

    // Configuration
    const CONFIG = {
        // Password (base64 encoded for basic obfuscation)
        // Current password: "TipsyDrive2024"
        // To change: btoa('YourNewPassword') in browser console, then paste here
        encodedPassword: 'dGRAMTIz',
        sessionKey: 'tipsydrive_auth',
        sessionDuration: 24 * 60 * 60 * 1000,
    };

    // Check if already authenticated
    function isAuthenticated() {
        try {
            const session = sessionStorage.getItem(CONFIG.sessionKey);
            if (!session) return false;
            const data = JSON.parse(session);
            if (data.expiry && Date.now() < data.expiry) {
                return true;
            }
        } catch (e) {
            // Ignore errors
        }
        try {
            sessionStorage.removeItem(CONFIG.sessionKey);
        } catch (e) {
            // Ignore errors
        }
        return false;
    }

    // Set authenticated session
    function setAuthenticated() {
        try {
            const data = {
                authenticated: true,
                expiry: Date.now() + CONFIG.sessionDuration
            };
            sessionStorage.setItem(CONFIG.sessionKey, JSON.stringify(data));
        } catch (e) {
            // Continue even if storage fails
        }
    }

    // Verify password
    function verifyPassword(password) {
        try {
            const storedPassword = atob(CONFIG.encodedPassword);
            return password === storedPassword;
        } catch (e) {
            return false;
        }
    }

    // If already authenticated, show content and exit
    if (isAuthenticated()) {
        var style = document.getElementById('auth-hide-content');
        if (style) style.remove();
        return;
    }

    // Create and inject the login overlay HTML
    function createLoginOverlay() {
        // Create overlay element
        const overlay = document.createElement('div');
        overlay.id = 'auth-overlay';

        // Set overlay styles directly
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2147483647;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        `;

        overlay.innerHTML = `
            <div style="
                background: #f8fafc;
                padding: 3rem;
                border-radius: 16px;
                box-shadow: 0 4px 24px rgba(0,0,0,0.1);
                max-width: 400px;
                width: 90%;
                text-align: center;
                border: 1px solid #e2e8f0;
            ">
                <div style="font-size: 3rem; margin-bottom: 1rem;">&#128274;</div>
                <div style="
                    font-size: 2.5rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #4f46e5, #059669);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 0.5rem;
                ">TipsyDrive</div>
                <div style="
                    color: #64748b;
                    margin-bottom: 2rem;
                    font-size: 0.95rem;
                ">Confidential Project Documentation</div>
                <form id="auth-form">
                    <input type="password" id="auth-password" placeholder="Enter access password" autocomplete="off" required style="
                        width: 100%;
                        padding: 1rem;
                        font-size: 1rem;
                        border: 2px solid #e2e8f0;
                        border-radius: 8px;
                        margin-bottom: 1rem;
                        outline: none;
                        box-sizing: border-box;
                        transition: border-color 0.2s;
                    ">
                    <button type="submit" id="auth-submit" style="
                        width: 100%;
                        padding: 1rem;
                        font-size: 1rem;
                        font-weight: 600;
                        background: #4f46e5;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: background 0.2s;
                    ">Access Documentation</button>
                </form>
                <div id="auth-error" style="
                    color: #dc2626;
                    font-size: 0.875rem;
                    margin-top: 1rem;
                    display: none;
                ">Incorrect password. Please try again.</div>
                <div style="
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e2e8f0;
                    color: #64748b;
                    font-size: 0.8rem;
                ">
                    This documentation is confidential and intended for authorized team members only.
                </div>
            </div>
        `;

        // Hide the original body content
        const originalDisplay = document.body.style.display;
        const children = Array.from(document.body.children);
        children.forEach(child => {
            if (child.id !== 'auth-overlay') {
                child.style.display = 'none';
            }
        });

        // Add overlay to body
        document.body.insertBefore(overlay, document.body.firstChild);

        // Remove the initial hide style and show body with overlay
        var hideStyleEl = document.getElementById('auth-hide-content');
        if (hideStyleEl) hideStyleEl.remove();
        document.body.style.opacity = '1';

        // Focus on password input
        const passwordInput = document.getElementById('auth-password');
        if (passwordInput) {
            passwordInput.focus();
        }

        // Handle input focus style
        if (passwordInput) {
            passwordInput.addEventListener('focus', function() {
                this.style.borderColor = '#4f46e5';
            });
            passwordInput.addEventListener('blur', function() {
                this.style.borderColor = '#e2e8f0';
            });
        }

        // Handle form submission
        const form = document.getElementById('auth-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                const password = document.getElementById('auth-password').value;
                const submitBtn = document.getElementById('auth-submit');
                const errorDiv = document.getElementById('auth-error');

                submitBtn.disabled = true;
                submitBtn.style.background = '#94a3b8';
                submitBtn.style.cursor = 'not-allowed';
                submitBtn.textContent = 'Verifying...';
                errorDiv.style.display = 'none';

                // Small delay for UX
                setTimeout(function() {
                    const isValid = verifyPassword(password);

                    if (isValid) {
                        setAuthenticated();
                        // Remove overlay and show content
                        overlay.remove();
                        children.forEach(child => {
                            child.style.display = '';
                        });
                    } else {
                        errorDiv.style.display = 'block';
                        submitBtn.disabled = false;
                        submitBtn.style.background = '#4f46e5';
                        submitBtn.style.cursor = 'pointer';
                        submitBtn.textContent = 'Access Documentation';
                        document.getElementById('auth-password').value = '';
                        document.getElementById('auth-password').focus();
                    }
                }, 300);
            });
        }

        // Handle button hover
        const submitBtn = document.getElementById('auth-submit');
        if (submitBtn) {
            submitBtn.addEventListener('mouseenter', function() {
                if (!this.disabled) {
                    this.style.background = '#4338ca';
                }
            });
            submitBtn.addEventListener('mouseleave', function() {
                if (!this.disabled) {
                    this.style.background = '#4f46e5';
                }
            });
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createLoginOverlay);
    } else {
        // DOM is already ready
        createLoginOverlay();
    }
})();
