# Complete Netlify Setup

Your Netlify site is deployed at: **https://watchpass.netlify.app**

## Step 1: Verify Function is Deployed

Check if your function is available:
```bash
curl https://watchpass.netlify.app/.netlify/functions/generate-pass
```

Or test with the test script:
```bash
export NETLIFY_FUNCTION_URL=https://watchpass.netlify.app/.netlify/functions/generate-pass
node test-netlify.js
```

## Step 2: Set Environment Variables in Netlify

1. Go to: https://app.netlify.com/sites/watchpass/settings/env
2. Click **Add a variable** and add these 5 variables:

   **Variable 1:**
   - Key: `APPLE_PASS_TYPE_ID`
   - Value: `pass.com.watchpass.app`
   - Scopes: All scopes
   - Click **Create variable**

   **Variable 2:**
   - Key: `APPLE_TEAM_ID`
   - Value: `9UMTSD7BF9`
   - Scopes: All scopes
   - Click **Create variable**

   **Variable 3:**
   - Key: `APPLE_ORG_NAME`
   - Value: `WatchPass`
   - Scopes: All scopes
   - Click **Create variable**

   **Variable 4:**
   - Key: `APPLE_PASS_CERT_PASSWORD`
   - Value: `(your p12 password)`
   - Scopes: All scopes
   - Click **Create variable**

   **Variable 5:**
   - Key: `APPLE_PASS_CERT_BASE64`
   - Value: `(your base64 certificate - the long string)`
   - Scopes: All scopes
   - Click **Create variable**

3. After adding all variables, **redeploy** the site:
   - Go to: https://app.netlify.com/sites/watchpass/deploys
   - Click **Trigger deploy** → **Deploy site**

## Step 3: Add Function URL to Supabase

1. Go to: https://supabase.com/dashboard/project/behplgclzojvorrpipas/settings/functions
2. Click **Add new secret**
3. **Name**: `PASS_SIGNING_SERVICE_URL`
4. **Value**: `https://watchpass.netlify.app/.netlify/functions/generate-pass`
5. Click **Add secret**

## Step 4: Test Everything

Test the Supabase Edge Function (it should now proxy to Netlify):
```bash
cd /Users/scott/Desktop/WatchPass-main
node test-supabase.js
```

If successful, you should get a `.pkpass` file instead of a 501 error!

## Step 5: Test in Your App

1. Build and run your iOS app
2. Navigate to a watch detail page
3. Tap "Add to Apple Wallet"
4. The pass should be generated and signed! 🎉

## Troubleshooting

### Function returns 500 error
- Check Netlify function logs: https://app.netlify.com/sites/watchpass/functions
- Verify all environment variables are set
- Make sure you redeployed after adding variables

### Function not found (404)
- The function might not have deployed correctly
- Try redeploying: `cd pass-signing-service && npm run deploy`

### CORS errors
- The function already includes CORS headers
- Make sure you're calling from the correct origin

## Your Function URL

**Netlify Function:**
```
https://watchpass.netlify.app/.netlify/functions/generate-pass
```

**Supabase Edge Function (proxies to Netlify):**
```
https://behplgclzojvorrpipas.supabase.co/functions/v1/generate-wallet-pass
```

