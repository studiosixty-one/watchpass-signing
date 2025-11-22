# Quick Deploy to Netlify

Follow these steps to deploy your pass signing service:

## Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

## Step 2: Navigate to Service Directory

```bash
cd pass-signing-service
```

## Step 3: Login to Netlify

```bash
netlify login
```

This will open your browser to authenticate.

## Step 4: Deploy

```bash
netlify deploy --prod
```

Follow the prompts:
- If asked to create a new site, say **yes**
- Choose a site name (or use the suggested one)
- The deployment will start automatically

## Step 5: Set Environment Variables

After deployment, you'll get a site URL. Now set your environment variables:

1. Go to https://app.netlify.com
2. Click on your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable** and add each of these:

   - **Variable name**: `APPLE_PASS_TYPE_ID`
   - **Value**: `pass.com.watchpass.app` (or your Pass Type ID)
   - Click **Create**

   - **Variable name**: `APPLE_TEAM_ID`
   - **Value**: `9UMTSD7BF9` (your Team ID from Apple Developer)
   - Click **Create**

   - **Variable name**: `APPLE_ORG_NAME`
   - **Value**: `WatchPass`
   - Click **Create**

   - **Variable name**: `APPLE_PASS_CERT_PASSWORD`
   - **Value**: `(your p12 password)`
   - Click **Create**

   - **Variable name**: `APPLE_PASS_CERT_BASE64`
   - **Value**: `(your base64 certificate - the long string)`
   - Click **Create**

## Step 6: Get Your Function URL

Your function will be available at:
```
https://your-site-name.netlify.app/.netlify/functions/generate-pass
```

Copy this URL!

## Step 7: Update Supabase

1. Go to Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets**
2. Click **Add new secret**
3. **Name**: `PASS_SIGNING_SERVICE_URL`
4. **Value**: `https://your-site-name.netlify.app/.netlify/functions/generate-pass`
5. Click **Add secret**

## Step 8: Redeploy Edge Function (Optional)

The Edge Function will automatically use the new secret, but you can verify it's set:

```bash
cd /Users/scott/Desktop/WatchPass-main
supabase functions deploy generate-wallet-pass
```

## Step 9: Test!

1. Build and run your iOS app
2. Navigate to a watch detail page
3. Tap "Add to Apple Wallet"
4. The pass should now be generated and signed properly! 🎉

## Troubleshooting

### Function returns 500 error
- Check Netlify function logs: Go to your site → **Functions** → Click on `generate-pass` → View logs
- Verify all environment variables are set correctly
- Make sure certificate password is correct

### CORS errors
- The function already includes CORS headers
- Make sure you're calling from the correct origin

### "openssl not found"
- Netlify functions should have openssl available
- If not, we may need to use a different approach (let me know!)

## That's It!

Once you complete these steps, your Apple Wallet passes should work! 🚀

