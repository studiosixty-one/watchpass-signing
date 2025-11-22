# Setup: Store Certificate in Supabase Storage

Since the certificate is too large for Lambda environment variables, we'll store it in Supabase Storage.

## Step 1: Upload Certificate to Supabase Storage

1. Go to: https://supabase.com/dashboard/project/behplgclzojvorrpipas/storage/buckets
2. Click **New bucket**
3. Name: `wallet-certificates`
4. Make it **Private** (not public)
5. Click **Create bucket**

6. Click on the `wallet-certificates` bucket
7. Click **Upload file**
8. Upload your `.p12` certificate file
9. Note the file path (e.g., `certificate.p12`)

## Step 2: Get Supabase Service Key

1. Go to: https://supabase.com/dashboard/project/behplgclzojvorrpipas/settings/api
2. Find **service_role** key (NOT the anon key)
3. Copy it - you'll need it for Netlify

## Step 3: Update Netlify Environment Variables

Go to: https://app.netlify.com/sites/watchpass/settings/env

**Remove:**
- `APPLE_PASS_CERT_BASE64` (no longer needed)

**Add/Update:**
- `SUPABASE_URL` = `https://behplgclzojvorrpipas.supabase.co`
- `SUPABASE_SERVICE_KEY` = `(your service_role key from Step 2)`
- `CERT_STORAGE_PATH` = `wallet-certificates/certificate.p12` (or your file path)

**Keep these:**
- `APPLE_PASS_TYPE_ID`
- `APPLE_TEAM_ID`
- `APPLE_ORG_NAME`
- `APPLE_PASS_CERT_PASSWORD`

## Step 4: Set Storage RLS Policy

The bucket needs to allow the service key to read:

1. Go to: https://supabase.com/dashboard/project/behplgclzojvorrpipas/storage/policies
2. Find `wallet-certificates` bucket
3. Create a policy that allows service role to read:
   ```sql
   CREATE POLICY "Service role can read certificates"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'wallet-certificates');
   ```

Or use the Supabase UI to create the policy.

## Step 5: Redeploy

After setting environment variables, Netlify will auto-redeploy, or trigger manually.

## Step 6: Test

```bash
cd /Users/scott/Desktop/WatchPass-main/pass-signing-service
export NETLIFY_FUNCTION_URL=https://watchpass.netlify.app/.netlify/functions/generate-pass
node test-netlify.js
```

## Benefits

- ✅ No 4KB limit
- ✅ Certificate stored securely in Supabase
- ✅ Can update certificate without redeploying function
- ✅ Certificate cached in Lambda memory for performance

