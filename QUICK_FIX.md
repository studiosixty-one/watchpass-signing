# Quick Fix: Deploy Function

The function isn't deployed yet. Here are the easiest ways to fix it:

## Method 1: Check Netlify Dashboard

1. Go to: https://app.netlify.com/sites/watchpass/deploys
2. Look at the most recent deployment
3. Check if it says "Functions" in the deployment details
4. If not, the function didn't deploy

## Method 2: Manual Function Upload

Since the CLI is having path issues, try this:

1. Go to: https://app.netlify.com/sites/watchpass/functions
2. If you see an option to "Add function" or "Upload function", use that
3. Upload the file: `netlify/functions/generate-pass.js`

## Method 3: Connect to Git (Easiest Long-term)

1. Create a GitHub repository
2. Push the `pass-signing-service` folder to it
3. In Netlify Dashboard:
   - Go to: https://app.netlify.com/sites/watchpass/settings/deploys
   - Click **Link repository**
   - Connect GitHub and select your repo
   - Set **Base directory** to the folder containing `netlify.toml`
   - Netlify will auto-deploy on every push

## Method 4: Check if Function is Actually There

The function might be deployed but at a different path. Try:

```bash
curl https://watchpass.netlify.app/.netlify/functions/generate-pass
```

If you get a different error (not 404), the function exists but might have a different issue.

## Current Status

- ✅ Site is deployed: https://watchpass.netlify.app
- ✅ Environment variables are set
- ❌ Function is not deployed (404 error)
- ✅ Supabase secret is set (you mentioned you added it)

## Next Steps

Once the function is deployed and working:
1. Test: `node test-netlify.js` (should return 200, not 404)
2. Test Supabase: `node test-supabase.js` (should return .pkpass file)

Let me know what you see in the Netlify Dashboard deploys section!

