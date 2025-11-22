# Deploying to Netlify

Netlify has a free tier that includes serverless functions, perfect for this use case!

## Quick Setup

### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

### 2. Navigate to the service directory

```bash
cd pass-signing-service
```

### 3. Login to Netlify

```bash
netlify login
```

This will open your browser to authenticate.

### 4. Initialize and Deploy

```bash
# Initialize (if first time)
netlify init

# Or deploy directly
netlify deploy --prod
```

### 5. Set Environment Variables

After deployment, set your environment variables in Netlify Dashboard:

1. Go to your site in Netlify Dashboard
2. Go to **Site settings** → **Environment variables**
3. Add these variables (copy from your Supabase secrets):
   - `APPLE_PASS_TYPE_ID` = `pass.com.watchpass.app`
   - `APPLE_TEAM_ID` = `9UMTSD7BF9` (your team ID)
   - `APPLE_ORG_NAME` = `WatchPass`
   - `APPLE_PASS_CERT_PASSWORD` = `(your p12 password)`
   - `APPLE_PASS_CERT_BASE64` = `(your base64 certificate)`

### 6. Get Your Function URL

After deployment, Netlify will give you a URL like:
```
https://your-site-name.netlify.app/.netlify/functions/generate-pass
```

Copy this URL - you'll need it for the next step.

### 7. Update Supabase Edge Function

Add the Netlify function URL as a secret in Supabase:

1. Go to Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets**
2. Add secret: `PASS_SIGNING_SERVICE_URL` = `https://your-site-name.netlify.app/.netlify/functions/generate-pass`

### 8. Update Edge Function Code

The Edge Function needs to proxy to your Netlify service. I'll update it for you.

## Testing Locally

You can test locally before deploying:

```bash
cd pass-signing-service
npm install
netlify dev
```

This will start a local server at `http://localhost:8888/.netlify/functions/generate-pass`

## Netlify Free Tier Limits

- **Function execution time**: 10 seconds (should be plenty)
- **Function invocations**: 125,000 per month (generous free tier)
- **Bandwidth**: 100 GB per month

This should be more than enough for your use case!

## Troubleshooting

### Function not found
- Make sure you deployed with `netlify deploy --prod`
- Check the function name matches: `generate-pass`

### Environment variables not working
- Make sure you set them in Netlify Dashboard (not just locally)
- Redeploy after adding new variables: `netlify deploy --prod`

### CORS errors
- The function already includes CORS headers
- Make sure you're calling it from the correct origin

