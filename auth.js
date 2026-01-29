// Simple client-side authentication for TipsyDrive Tech Documentation
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
        // Current password: "td@123"
        // To change: btoa('YourNewPassword') in browser console, then paste here
        encodedPassword: 'dGRAMTIz',
        sessionKey: 'tipsydrive_tech_auth',
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

        // Set overlay styles - using TipsyDrive color palette
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #EAEFEF;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2147483647;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
        `;

        overlay.innerHTML = `
            <div style="
                background: #FFFFFF;
                padding: 3rem;
                border-radius: 16px;
                box-shadow: 0 4px 24px rgba(37, 52, 63, 0.08);
                max-width: 400px;
                width: 90%;
                text-align: center;
                border: 1px solid #E1E7EB;
            ">
                <img src="logo.png" alt="TipsyDrive" style="
                    width: 72px;
                    height: 72px;
                    border-radius: 16px;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 4px 12px rgba(37, 52, 63, 0.1);
                ">
                <div style="
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #25343F;
                    margin-bottom: 0.5rem;
                ">TipsyDrive</div>
                <div style="
                    color: #6B7B8A;
                    margin-bottom: 2rem;
                    font-size: 0.95rem;
                ">Technical Documentation</div>
                <form id="auth-form">
                    <input type="password" id="auth-password" placeholder="Enter access password" autocomplete="off" required style="
                        width: 100%;
                        padding: 1rem;
                        font-size: 1rem;
                        border: 2px solid #E1E7EB;
                        border-radius: 12px;
                        margin-bottom: 1rem;
                        outline: none;
                        box-sizing: border-box;
                        transition: border-color 0.2s;
                        background: #FFFFFF;
                        color: #25343F;
                    ">
                    <button type="submit" id="auth-submit" style="
                        width: 100%;
                        padding: 1rem;
                        font-size: 1rem;
                        font-weight: 600;
                        background: #FF9B51;
                        color: #FFFFFF;
                        border: none;
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">Access Documentation</button>
                </form>
                <div id="auth-error" style="
                    color: #EA4335;
                    font-size: 0.875rem;
                    margin-top: 1rem;
                    display: none;
                    padding: 0.75rem;
                    background: rgba(234, 67, 53, 0.1);
                    border-radius: 8px;
                ">Incorrect password. Please try again.</div>
                <div style="
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #E1E7EB;
                    color: #6B7B8A;
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
                this.style.borderColor = '#FF9B51';
            });
            passwordInput.addEventListener('blur', function() {
                this.style.borderColor = '#E1E7EB';
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
                submitBtn.style.background = '#BFC9D1';
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
                        submitBtn.style.background = '#FF9B51';
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
                    this.style.background = '#e88a42';
                }
            });
            submitBtn.addEventListener('mouseleave', function() {
                if (!this.disabled) {
                    this.style.background = '#FF9B51';
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
