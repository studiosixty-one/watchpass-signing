# Connect Repository to Netlify

Your code is now on GitHub! Now connect it to Netlify:

## Step 1: Link Repository in Netlify

1. Go to: https://app.netlify.com/sites/watchpass/settings/deploys
2. Scroll down to **Build & deploy** section
3. Under **Continuous Deployment**, click **Link repository**
4. If prompted, authorize Netlify to access your GitHub account
5. Select the repository: **studiosixty-one/watchpass-signing**
6. Click **Link repository**

## Step 2: Configure Build Settings

After linking, configure the build:

1. **Base directory**: Leave blank (or set to the root if needed)
2. **Build command**: Leave blank (no build needed)
3. **Publish directory**: `.` (or leave blank)

## Step 3: Deploy

1. After linking, Netlify will automatically start a deployment
2. You can also manually trigger: Click **Trigger deploy** → **Deploy site**
3. Wait for deployment to complete (1-2 minutes)

## Step 4: Verify Function is Deployed

1. Go to: https://app.netlify.com/sites/watchpass/functions
2. You should now see `generate-pass` listed!
3. If you see it, the function is deployed ✅

## Step 5: Test the Function

Once deployed, test it:

```bash
cd /Users/scott/Desktop/WatchPass-main/pass-signing-service
export NETLIFY_FUNCTION_URL=https://watchpass.netlify.app/.netlify/functions/generate-pass
node test-netlify.js
```

## Step 6: Verify Environment Variables

Make sure your environment variables are still set:
1. Go to: https://app.netlify.com/sites/watchpass/settings/env
2. Verify all 5 variables are there:
   - `APPLE_PASS_TYPE_ID`
   - `APPLE_TEAM_ID`
   - `APPLE_ORG_NAME`
   - `APPLE_PASS_CERT_PASSWORD`
   - `APPLE_PASS_CERT_BASE64`

## Step 7: Add to Supabase (If Not Done)

1. Go to: https://supabase.com/dashboard/project/behplgclzojvorrpipas/settings/functions
2. Add secret: `PASS_SIGNING_SERVICE_URL` = `https://watchpass.netlify.app/.netlify/functions/generate-pass`

## Step 8: Test Full Integration

```bash
cd /Users/scott/Desktop/WatchPass-main
node test-supabase.js
```

Should now return a .pkpass file! 🎉

## Troubleshooting

### Function still not showing
- Check deployment logs: https://app.netlify.com/sites/watchpass/deploys
- Look for any errors in the build
- Make sure `netlify/functions/generate-pass.js` is in the repository

### Environment variables missing
- They should persist, but verify they're still there
- If missing, add them again in the dashboard

### Function returns 500
- Check function logs: https://app.netlify.com/sites/watchpass/functions
- Click on `generate-pass` to see error logs
- Verify all environment variables are correct

