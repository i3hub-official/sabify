import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import {
    twoFactor,
    username,
    magicLink,
    jwt,
    admin,
    apiKey,
    organization,
    multiSession,
} from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";

const client = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(client, {
        provider: "postgresql",
    }),
    appName: "sabify",
    plugins: [
        multiSession(),
        organization(),
        apiKey(),
        admin(),
        jwt(),
        passkey(),
        magicLink({
            sendMagicLink({ email, token, url }, request) {
                // Send email with magic link
            },
        }),
        username(),
        twoFactor(),
    ],
});
