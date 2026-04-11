// app/actions/auth.ts
"use server"

import { createClient } from '@/utils/supabase/server'; // Your Supabase SSR setup
import { redirect } from 'next/navigation';
import { getURL } from '@/utils/url';

export async function signInWithGitHub() {
    const supabase = await createClient();
    
    // Explicit Site URL from global utility
    const siteUrl = getURL();
    const redirectTo = `${siteUrl}api/auth/callback`;

    console.log(`[auth] Triggering GitHub OAuth. Redirecting to: ${redirectTo}`);

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: redirectTo,
            scopes: 'repo admin:repo_hook' 
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    // Redirect the user to the GitHub authorization screen
    if (data.url) {
        redirect(data.url);
    }
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}