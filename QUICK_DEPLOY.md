# Quick Deploy to Netlify (Using Local CLI)

Since you have Netlify CLI installed locally, use these commands:

## Step 1: Login to Netlify

```bash
cd /Users/scott/Desktop/WatchPass-main/pass-signing-service
npm run login
```

This will open your browser to authenticate.

## Step 2: Deploy

```bash
npm run deploy
```

Or use npx directly:
```bash
npx netlify deploy --prod
```

Follow the prompts:
- **Create a new site?** → Type `y` and press Enter
- **Site name?** → Press Enter to use the suggested name, or type your own

## Step 3: Set Environment Variables

After deployment, you'll get a URL like `https://your-site-name.netlify.app`

1. Go to https://app.netlify.com
2. Click on your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable** and add each of these:

   **Variable 1:**
   - Name: `APPLE_PASS_TYPE_ID`
   - Value: `pass.com.watchpass.app`
   - Click **Create**

   **Variable 2:**
   - Name: `APPLE_TEAM_ID`
   - Value: `9UMTSD7BF9` (your Team ID)
   - Click **Create**

   **Variable 3:**
   - Name: `APPLE_ORG_NAME`
   - Value: `WatchPass`
   - Click **Create**

   **Variable 4:**
   - Name: `APPLE_PASS_CERT_PASSWORD`
   - Value: `(your p12 password)`
   - Click **Create**

   **Variable 5:**
   - Name: `APPLE_PASS_CERT_BASE64`
   - Value: `(your base64 certificate - paste the long string)`
   - Click **Create**

## Step 4: Get Your Function URL

Your function will be available at:
```
https://your-site-name.netlify.app/.netlify/functions/generate-pass
```

**Copy this URL!**

## Step 5: Add to Supabase

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/behplgclzojvorrpipas
2. Go to **Project Settings** → **Edge Functions** → **Secrets**
3. Click **Add new secret**
4. **Name**: `PASS_SIGNING_SERVICE_URL`
5. **Value**: `https://your-site-name.netlify.app/.netlify/functions/generate-pass`
6. Click **Add secret**

## Step 6: Test!

1. Build and run your iOS app
2. Navigate to a watch detail page
3. Tap "Add to Apple Wallet"
4. The pass should now be generated! 🎉

## Troubleshooting

### "Command not found"
- Make sure you're in the `pass-signing-service` directory
- Try: `npx netlify --version` to verify it's working

### Deployment fails
- Make sure you're logged in: `npm run login`
- Check you're in the right directory

### Function returns errors
- Check Netlify function logs: Go to your site → **Functions** → Click `generate-pass` → View logs
- Verify all environment variables are set correctly

