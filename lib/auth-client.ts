import { createAuthClient } from "better-auth/react"

// Let Better Auth use the current origin in production and localhost in dev.
export const authClient = createAuthClient({})
