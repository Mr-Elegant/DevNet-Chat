# DevNet Chat: Deployment and Auth Setup

This guide walks through deploying the app on Vercel and setting up Better Auth with GitHub and Google sign-in.

## 1. What you need before deploying

Make sure you have:

- A GitHub repository for the app
- A Vercel account
- A PostgreSQL database URL
- Better Auth secret key
- GitHub OAuth app credentials
- Google OAuth client credentials

## 2. Environment variables

### Local development

Use this in your local [.env](/c:/web working/nextjs/1. nextjs projects/t3-chat/.env):

```env
BETTER_AUTH_URL=http://localhost:3000
```

You should also keep your other local secrets there, for example:

```env
BETTER_AUTH_SECRET=your_secret_here
DATABASE_URL=your_database_url_here
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OPENROUTER_API_KEY=your_openrouter_key
```

### Production on Vercel

In Vercel, set:

```env
BETTER_AUTH_URL=https://dev-net-chat.vercel.app
```

Do not use `http://localhost:3000` in production.

If you later add a custom domain, update this value to that domain instead.

## 3. Why `BETTER_AUTH_URL` matters

Better Auth uses this URL as the base for auth flows and callback handling.

If this value is wrong, sign-in can:

- stay on `Signing in...`
- redirect to the wrong domain
- fail after OAuth login

## 4. Vercel deployment steps

1. Push your code to GitHub.
2. Open Vercel and import the repository.
3. Let Vercel detect it as a Next.js project.
4. Leave build settings on default unless you have a special reason to change them.
5. Add the required environment variables in Vercel:
   - `BETTER_AUTH_URL`
   - `BETTER_AUTH_SECRET`
   - `DATABASE_URL`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `OPENROUTER_API_KEY`
6. Redeploy after changing environment variables.

## 5. Google OAuth setup

In Google Cloud Console:

1. Open your OAuth client.
2. Add these **Authorized redirect URIs**:

```txt
http://localhost:3000/api/auth/callback/google
https://dev-net-chat.vercel.app/api/auth/callback/google
```

3. Save the client.
4. Copy the client ID and client secret into Vercel and local `.env`.

### Important

The redirect URI must match your deployed auth route exactly.

## 6. GitHub OAuth setup

In GitHub Developer Settings for your OAuth App:

1. Open your OAuth app.
2. Set the **Authorization callback URL** to:

```txt
http://localhost:3000/api/auth/callback/github
https://dev-net-chat.vercel.app/api/auth/callback/github
```

GitHub only allows one callback URL per OAuth app, so in practice you usually keep:

```txt
https://dev-net-chat.vercel.app/api/auth/callback/github
```

and use localhost only for local testing if needed through a separate app or by temporarily switching the callback URL.

## 7. Better Auth configuration notes

Your auth config lives in [lib/auth.ts](/c:/web working/nextjs/1. nextjs projects/t3-chat/lib/auth.ts).

Current social providers:

- `github`
- `google`

The client is in [lib/auth-client.ts](/c:/web working/nextjs/1. nextjs projects/t3-chat/lib/auth-client.ts).

It should not hardcode `http://localhost:3000` for production.

## 8. Common issues

### Sign-in stays on "Signing in..."

Usually caused by one of these:

- `BETTER_AUTH_URL` is still set to localhost in Vercel
- OAuth callback URL is incorrect
- missing `BETTER_AUTH_SECRET`
- missing or wrong database URL

### Google login fails after redirect

Check:

- the redirect URI in Google Console
- the production domain in Vercel env vars
- the OAuth consent screen settings

### GitHub login fails after redirect

Check:

- GitHub callback URL
- Vercel production env vars
- that the GitHub app is using the correct client ID and secret

## 9. Recommended production values

For Vercel production:

```env
BETTER_AUTH_URL=https://dev-net-chat.vercel.app
```

For local development:

```env
BETTER_AUTH_URL=http://localhost:3000
```

## 10. Final checklist

- `npm run build` passes locally
- Vercel environment variables are set
- Google redirect URI is correct
- GitHub callback URL is correct
- Database is reachable from Vercel
- Better Auth secret is present in production

