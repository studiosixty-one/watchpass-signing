# Fix: Remove Large Environment Variable

The deployment is failing because `APPLE_PASS_CERT_BASE64` is still in your Netlify environment variables and it's too large (exceeds 4KB limit).

## Step 1: Remove the Large Variable

1. Go to: https://app.netlify.com/sites/watchpass/settings/env
2. Find `APPLE_PASS_CERT_BASE64` in the list
3. Click the **three dots** (⋯) next to it
4. Click **Delete**
5. Confirm deletion

## Step 2: Verify Required Variables Are Set

Make sure these are still there:
- ✅ `APPLE_PASS_TYPE_ID`
- ✅ `APPLE_TEAM_ID`
- ✅ `APPLE_ORG_NAME`
- ✅ `APPLE_PASS_CERT_PASSWORD`
- ✅ `SUPABASE_URL` = `https://behplgclzojvorrpipas.supabase.co`
- ✅ `SUPABASE_SERVICE_KEY` = (your service_role key)
- ✅ `CERT_STORAGE_PATH` = `wallet-certificates/certificate.p12` (or your file path)

## Step 3: Redeploy

After removing `APPLE_PASS_CERT_BASE64`, the deployment should succeed. You can:

**Option A: Wait for auto-deploy**
- Netlify will automatically redeploy when you remove the variable

**Option B: Trigger manually**
- Go to: https://app.netlify.com/sites/watchpass/deploys
- Click **Trigger deploy** → **Deploy site**

**Option C: Use CLI** (after removing the variable)
```bash
cd /Users/scott/Desktop/WatchPass-main/pass-signing-service
npx netlify deploy --prod
```

## Why This Happens

Netlify tries to include ALL environment variables when deploying functions to AWS Lambda. Lambda has a 4KB limit for all environment variables combined. The base64 certificate is too large, so we moved it to Supabase Storage instead.

Once you remove `APPLE_PASS_CERT_BASE64`, the deployment should work! ✅

