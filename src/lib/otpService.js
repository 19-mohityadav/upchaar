/**
 * otpService.js
 * ─────────────────────────────────────────────────
 * Wraps Supabase's built-in phone OTP (Twilio Verify) API.
 *
 * sendOtp(phone)          → sends a 6-digit OTP SMS via Twilio Verify
 * verifyOtp(phone, token) → verifies the 6-digit OTP
 *
 * Phone numbers must be in E.164 format (+91XXXXXXXXXX for India).
 * ─────────────────────────────────────────────────
 */

import { supabase } from './supabase.js';

/**
 * Normalise a raw phone input to E.164 format.
 * Assumes Indian (+91) numbers when no country code is provided.
 * Examples:
 *   '9876543210'    → '+919876543210'
 *   '+919876543210' → '+919876543210'
 */
export function normalisePhone(raw) {
    const cleaned = raw.replace(/[\s\-().]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    // Strip leading zero (Indian mobile numbers sometimes written as 09876…)
    const digits = cleaned.replace(/^0+/, '');
    return `+91${digits}`;
}

/**
 * sendOtp – triggers Supabase phone OTP via Twilio Verify.
 * @param {string} phone  Raw phone number entered by user
 * @throws Error with user-friendly message
 */
export async function sendOtp(phone) {
    const e164 = normalisePhone(phone);

    const { error } = await supabase.auth.signInWithOtp({
        phone: e164,
    });

    if (error) {
        // Surface a clean message
        if (error.message.includes('rate')) {
            throw new Error('Too many OTP requests. Please wait a minute and try again.');
        }
        throw new Error(error.message || 'Failed to send OTP. Please check the number and try again.');
    }

    return e164; // Return normalised phone so callers can store it
}

/**
 * verifyOtp – verifies the 6-digit OTP without creating a new session.
 * We use type 'sms' because Twilio Verify is configured as the SMS provider.
 * @param {string} phone  E.164 phone (returned from sendOtp)
 * @param {string} token  6-digit OTP entered by user
 * @returns {object}      { user, session } from Supabase
 * @throws Error with user-friendly message
 */
export async function verifyOtp(phone, token) {
    const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: token.trim(),
        type: 'sms',
    });

    if (error) {
        if (error.message.toLowerCase().includes('expired')) {
            throw new Error('OTP has expired. Please request a new code.');
        }
        if (error.message.toLowerCase().includes('invalid')) {
            throw new Error('Invalid OTP. Please check the code and try again.');
        }
        throw new Error(error.message || 'OTP verification failed.');
    }

    return data;
}
