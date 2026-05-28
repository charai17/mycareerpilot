# Google Auth Setup

Google sign-in is wired in the app, but it will only work after Google is enabled in Supabase.

In Supabase:

1. Go to **Authentication**.
2. Open **Sign In / Providers**.
3. Enable **Google**.
4. Add the Google client ID and client secret from Google Cloud.
5. Add your app URL to the allowed redirect URLs.

For local development, the redirect URL is usually:

```text
http://localhost:3000
```

For production, add the deployed Vercel URL later.
