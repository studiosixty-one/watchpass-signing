# Test After Redeploy

## Step 1: Trigger Redeploy in Netlify Dashboard

Since you've added the environment variables, you need to trigger a new deployment:

1. Go to: https://app.netlify.com/sites/watchpass/deploys
2. Click **Trigger deploy** button (top right)
3. Select **Deploy site**
4. Wait for deployment to complete (usually 1-2 minutes)

## Step 2: Test Netlify Function

Once deployment is complete, test the function:

```bash
cd /Users/scott/Desktop/WatchPass-main/pass-signing-service
export NETLIFY_FUNCTION_URL=https://watchpass.netlify.app/.netlify/functions/generate-pass
node test-netlify.js
```

**Expected results:**
- ✅ If it returns a 200 status with a .pkpass file → Success!
- ⚠️ If it returns 500 with an error → Check the error message
- ❌ If it returns 404 → Function not deployed, check deployment logs

## Step 3: Check Function Logs

If there are errors, check the logs:
1. Go to: https://app.netlify.com/sites/watchpass/functions
2. Click on `generate-pass`
3. View the logs to see any errors

## Step 4: Add to Supabase (Once Netlify Works)

Once the Netlify function is working:

1. Go to: https://supabase.com/dashboard/project/behplgclzojvorrpipas/settings/functions
2. Click **Add new secret**
3. **Name**: `PASS_SIGNING_SERVICE_URL`
4. **Value**: `https://watchpass.netlify.app/.netlify/functions/generate-pass`
5. Click **Add secret**

## Step 5: Test Full Integration

Test the Supabase Edge Function (it will proxy to Netlify):

```bash
cd /Users/scott/Desktop/WatchPass-main
node test-supabase.js
```

**Expected result:**
- Should return a .pkpass file (not a 501 error)
- File size should be several KB

## Troubleshooting

### Function returns 404
- Make sure you triggered a redeploy after adding environment variables
- Check that the function file exists in `netlify/functions/generate-pass.js`
- Check deployment logs in Netlify dashboard

### Function returns 500
- Check function logs in Netlify dashboard
- Verify all 5 environment variables are set correctly
- Make sure certificate password is correct
- Verify base64 certificate is complete (no line breaks)

### Environment variables not working
- Make sure they're set in Netlify Dashboard (not just locally)
- They must be marked for "All scopes" or "Production"
- Redeploy after adding/changing variables

