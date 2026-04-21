import { createAuthClient } from "better-auth/client";
import type { auth } from "../../auth.ts";
import {
    inferAdditionalFields,
    twoFactorClient,
    usernameClient,
    magicLinkClient,
    // passkeyClient,
    adminClient,
    // apiKeyClient,
    organizationClient,
    multiSessionClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    plugins: [
        inferAdditionalFields<typeof auth>(),
        twoFactorClient(),
        usernameClient(),
        magicLinkClient(),
        // passkeyClient(),
        adminClient(),
        // apiKeyClient(),
        organizationClient(),
        multiSessionClient(),
    ],
});
