# Fix: Environment Variables Too Large

The base64 certificate is too large for deployment-time environment variables (4KB limit). 

## Solution: Set Variables in Netlify Dashboard

**Don't set them during deployment** - set them in the Netlify Dashboard instead.

## Step 1: Deploy Without Environment Variables

The function is already deployed. Now we just need to set the environment variables in the dashboard.

## Step 2: Set Environment Variables in Netlify Dashboard

1. Go to: https://app.netlify.com/sites/watchpass/settings/env
2. Click **Add a variable** for each:

   **Variable 1:**
   - Key: `APPLE_PASS_TYPE_ID`
   - Value: `pass.com.watchpass.app`
   - Click **Create variable**

   **Variable 2:**
   - Key: `APPLE_TEAM_ID`
   - Value: `9UMTSD7BF9`
   - Click **Create variable**

   **Variable 3:**
   - Key: `APPLE_ORG_NAME`
   - Value: `WatchPass`
   - Click **Create variable**

   **Variable 4:**
   - Key: `APPLE_PASS_CERT_PASSWORD`
   - Value: `(your p12 password)`
   - Click **Create variable**

   **Variable 5:**
   - Key: `APPLE_PASS_CERT_BASE64`
   - Value: `(your base64 certificate - paste the entire long string)`
   - Click **Create variable**

## Step 3: Redeploy to Apply Variables

After setting all variables:

1. Go to: https://app.netlify.com/sites/watchpass/deploys
2. Click **Trigger deploy** → **Deploy site**
3. Wait for deployment to complete

## Step 4: Test the Function

```bash
export NETLIFY_FUNCTION_URL=https://watchpass.netlify.app/.netlify/functions/generate-pass
node test-netlify.js
```

## Step 5: Connect to Supabase

1. Go to: https://supabase.com/dashboard/project/behplgclzojvorrpipas/settings/functions
2. Add secret: `PASS_SIGNING_SERVICE_URL` = `https://watchpass.netlify.app/.netlify/functions/generate-pass`

## Alternative: Use Netlify's Build Environment

If the certificate is still too large, you can:
1. Store it in Netlify's encrypted environment variables (they have a higher limit)
2. Or use Netlify's file-based secrets
3. Or load it from Supabase Storage

But for now, try setting it in the dashboard - Netlify dashboard environment variables have a much higher limit than deployment-time variables.

