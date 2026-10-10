import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import api, { setAccessToken } from '../../services/api';

/**
 * GoogleSignInButton
 *
 * Renders the official Google Sign-In button.
 * On success: sends the Google credential to our backend POST /api/auth/google,
 * receives our own accessToken + refreshToken (cookie), and calls onSuccess with
 * { accessToken, user } so the parent (AuthModal, LoginPage, etc.) can update
 * AuthContext exactly the same way as a normal login.
 *
 * Props:
 *   role       - 'creator' | 'editor' (passed to backend for new user creation)
 *   onSuccess  - callback({ accessToken, user }) called after successful auth
 *   onError    - optional callback(errorMessage) called on failure
 */
export default function GoogleSignInButton({ role = 'creator', onSuccess, onError }) {
    const [originBlocked, setOriginBlocked] = useState(false);

    async function handleGoogleSuccess(credentialResponse) {
        try {
            const res = await api.post('/api/auth/google', {
                credential: credentialResponse.credential,
                role,
            });

            const { accessToken, user } = res.data;

            // Store in volatile memory only
            if (accessToken) {
                setAccessToken(accessToken);
            }

            if (onSuccess) {
                onSuccess({ accessToken, user });
            }

        } catch (err) {
            const message =
                err?.response?.data?.message || 'Google sign-in failed. Please try again.';
            console.error('[GoogleSignIn]', message);
            if (onError) onError(message);
        }
    }

    function handleGoogleError() {
        // Typically triggered when origin is not authorized or user closed prompt
        const message = 'Google sign-in unavailable or cancelled.';
        console.warn('[GoogleSignIn]', message);
        setOriginBlocked(true);
        if (onError) onError(message);
    }

    if (originBlocked) {
        return (
            <div className="w-full text-center py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                Google OAuth origin not whitelisted in Google Cloud Console. Please log in with your email & password below.
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center min-h-[44px]">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                shape="rectangular"
                text="signin_with"
                size="large"
                width="360"
                logo_alignment="center"
            />
        </div>
    );
}

