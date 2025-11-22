# Verify Deployment

After deployment completes, verify everything is set up:

## Step 1: Check Deployment Status

1. Go to: https://app.netlify.com/sites/watchpass/deploys
2. Check the latest deployment - should show "Published" ✅

## Step 2: Verify Function is Deployed

1. Go to: https://app.netlify.com/sites/watchpass/functions
2. You should see `generate-pass` listed ✅

## Step 3: Verify Environment Variables

Go to: https://app.netlify.com/sites/watchpass/settings/env

**Required variables:**
- ✅ `APPLE_PASS_TYPE_ID`
- ✅ `APPLE_TEAM_ID`
- ✅ `APPLE_ORG_NAME`
- ✅ `APPLE_PASS_CERT_PASSWORD`
- ✅ `SUPABASE_URL` = `https://behplgclzojvorrpipas.supabase.co`
- ✅ `SUPABASE_SERVICE_KEY` = (your service_role key)
- ✅ `CERT_STORAGE_PATH` = `wallet-certificates/certificate.p12` (or your file path)

**Should NOT have:**
- ❌ `APPLE_PASS_CERT_BASE64` (removed - too large)

## Step 4: Verify Certificate in Supabase Storage

1. Go to: https://supabase.com/dashboard/project/behplgclzojvorrpipas/storage/buckets
2. Click on `wallet-certificates` bucket
3. Verify your `.p12` file is there

## Step 5: Test the Function

```bash
cd /Users/scott/Desktop/WatchPass-main/pass-signing-service
export NETLIFY_FUNCTION_URL=https://watchpass.netlify.app/.netlify/functions/generate-pass
node test-netlify.js
```

**Expected results:**
- ✅ Status 200 with .pkpass file = Success!
- ⚠️ Status 500 = Check error message:
  - "Failed to fetch certificate" = Check Supabase Storage setup
  - "Missing required environment variables" = Check Netlify env vars
  - "Failed to sign pass" = Check certificate password

## Step 6: Test Full Integration

Once Netlify function works:

```bash
cd /Users/scott/Desktop/WatchPass-main
node test-supabase.js
```

Should return a .pkpass file! 🎉

## Troubleshooting

### Function returns 500: "Failed to fetch certificate"
- Check certificate is uploaded to Supabase Storage
- Verify `CERT_STORAGE_PATH` matches the file path
- Check `SUPABASE_SERVICE_KEY` is correct (service_role, not anon)
- Verify storage bucket policy allows service role to read

### Function returns 500: "Failed to sign pass"
- Check `APPLE_PASS_CERT_PASSWORD` is correct
- Verify certificate file is valid .p12 format
- Check function logs for openssl errors

### Function not found (404)
- Check deployment completed successfully
- Verify function appears in Netlify functions list
- Try redeploying

