import { createAuthClient } from "better-auth/svelte";
import { browser } from "$app/environment";

export const authClient = createAuthClient({
    // If we're in the browser, use the current origin. 
    // If we're on the server, use the environment variable.
    baseURL: browser ? window.location.origin : "http://localhost:5173"
});
