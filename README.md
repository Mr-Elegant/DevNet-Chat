# DevNet Chat

DevNet Chat is a modern AI chat workspace built with Next.js, Better Auth, Prisma, and the AI SDK. It gives users a polished place to sign in, create chats, continue old threads, and manage conversations from a responsive sidebar and message composer.

## What This App Does

This app is designed as a full chat product, not just a demo page. A user can:

- sign in with GitHub or Google
- create a new chat thread
- continue an existing chat
- see saved conversation history
- delete chats from the sidebar with optimistic UI feedback
- search chats quickly
- use a responsive mobile drawer for navigation
- talk to an OpenRouter-backed model through the chat API

## Main Product Flow

### 1. Authentication

The user lands on the sign-in page and chooses either GitHub or Google.

After sign-in:

- Better Auth creates or resumes the user session
- the app redirects into the protected chat area

### 2. Home Chat Workspace

The root page shows a clean assistant-style landing area with:

- a model selector
- a prompt box
- quick prompt suggestions
- a polished empty-state experience

This is the entry point for starting a new conversation.

### 3. Existing Chat Thread

When the user opens `/chat/[chatId]`:

- the app loads the saved messages for that chat
- the message history is reconstructed from the database
- the composer stays ready for follow-up messages
- chat messages stream back from the API

### 4. Sidebar Management

The sidebar lets the user:

- browse chats grouped by time
- search conversations
- delete a chat
- see the delete action animate out smoothly
- keep the current active chat highlighted

## Features

- GitHub and Google sign-in
- Better Auth-based session handling
- PostgreSQL + Prisma persistence
- OpenRouter-powered AI responses
- streaming chat UI with the AI SDK
- optimistic sidebar delete
- mobile-friendly drawer sidebar
- responsive sign-in page
- modern animated UI using `motion`
- dark-friendly, glassy visual style

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Prisma
- PostgreSQL
- Better Auth
- AI SDK
- OpenRouter
- TanStack Query
- Motion
- Tailwind CSS
- Sonner

## Project Structure

### App routes

- `app/(auth)/sign-in/page.tsx`
  - sign-in page for GitHub and Google
- `app/(auth)/layout.tsx`
  - blocks authenticated users from visiting auth routes
- `app/(root)/layout.tsx`
  - protected app shell with sidebar and header
- `app/(root)/page.tsx`
  - home chat view
- `app/(root)/chat/[chatId]/page.tsx`
  - existing conversation view
- `app/api/auth/[...all]/route.ts`
  - Better Auth handler
- `app/api/chat/route.ts`
  - AI chat streaming endpoint
- `app/api/ai/get-models/route.ts`
  - fetches usable OpenRouter models

### Core modules

- `modules/authentication`
  - auth actions and user button
- `modules/chat`
  - chat actions, hooks, sidebar, and chat view components
- `components/ai-elements`
  - reusable UI pieces for prompts, messages, reasoning, attachments, model selector, and more
- `components/ui`
  - shared design system components

## How Chat Works

### New chat

1. User enters a prompt.
2. The app creates a chat record in the database.
3. The message is sent to the chat API.
4. OpenRouter streams the assistant response.
5. Both user and assistant messages are stored.

### Existing chat

1. User opens a saved thread.
2. The app loads the chat and messages from the database.
3. The UI reconstructs the message stream.
4. The user continues the conversation from the same thread.

### Delete chat

1. User clicks delete in the sidebar.
2. The chat disappears optimistically from the UI.
3. The API deletes the record in the background.
4. If the request fails, the item is restored.

## Authentication Flow

Better Auth is used for:

- social sign-in
- session management
- protected routes
- server-side session checks

Important auth files:

- `lib/auth.ts`
- `lib/auth-client.ts`
- `app/api/auth/[...all]/route.ts`
- `modules/authentication/actions/index.ts`

## Environment Variables

### Local development

```env
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_secret_here
DATABASE_URL=your_postgres_connection_string
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Vercel production

```env
BETTER_AUTH_URL=https://dev-net-chat.vercel.app
BETTER_AUTH_SECRET=your_secret_here
DATABASE_URL=your_postgres_connection_string
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OPENROUTER_API_KEY=your_openrouter_api_key
```

If you add a custom domain later, update `BETTER_AUTH_URL` to that domain and redeploy.

## OAuth Redirect URLs

### Google

Use this redirect URI in Google Cloud Console:

```txt
http://localhost:3000/api/auth/callback/google
https://dev-net-chat.vercel.app/api/auth/callback/google
```

### GitHub

Use this callback URL in GitHub OAuth App settings:

```txt
http://localhost:3000/api/auth/callback/github
https://dev-net-chat.vercel.app/api/auth/callback/github
```

If you only keep one production app, the production callback is the one that must match exactly.

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Build and Run

Production build:

```bash
npm run build
```

Start production server locally:

```bash
npm run start
```

Lint:

```bash
npm run lint
```

## Deployment

The app is ready for Vercel deployment.

Recommended steps:

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Add the production environment variables.
4. Make sure OAuth callback URLs match the deployed domain.
5. Redeploy after any auth-related environment change.

For a deeper deployment and auth checklist, see:

- [DEPLOYMENT_AND_AUTH_SETUP.md](./DEPLOYMENT_AND_AUTH_SETUP.md)

## Notes

- Prisma client generation runs automatically after install.
- The auth client uses the current origin instead of a hardcoded localhost URL.
- The UI is responsive and includes a mobile drawer sidebar.
- The sidebar delete flow uses optimistic UI updates and animated removal.

## License

No license file has been added yet. Add one if you want the project to be public.
