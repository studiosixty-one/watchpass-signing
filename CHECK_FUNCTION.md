# Check Function Deployment

The function is still returning 404. Let's verify:

## Step 1: Check Netlify Function Logs

1. Go to: https://app.netlify.com/sites/watchpass/functions
2. Do you see `generate-pass` listed?
3. If yes, click on it to see logs
4. If no, the function isn't deployed

## Step 2: Check Deployment Logs

1. Go to: https://app.netlify.com/sites/watchpass/deploys
2. Click on the most recent deployment
3. Look for "Functions" in the deployment summary
4. Does it say "0 functions" or show the function?

## Step 3: Verify Function File Location

The function should be at: `netlify/functions/generate-pass.js`

Netlify expects functions in a specific structure. The issue might be:
- Function file not in the right location
- `netlify.toml` not configured correctly
- Functions directory not being included in deployment

## Step 4: Alternative - Check Supabase Secret

You mentioned you added `PASS_SIGNING_SERVICE_URL` to Supabase. Let's verify:

1. Go to: https://supabase.com/dashboard/project/behplgclzojvorrpipas/settings/functions
2. Do you see `PASS_SIGNING_SERVICE_URL` in the list?
3. What's the value? It should be: `https://watchpass.netlify.app/.netlify/functions/generate-pass`

## Quick Test

Try accessing the function directly in your browser:
https://watchpass.netlify.app/.netlify/functions/generate-pass

- If you see a function response (even an error), it's deployed
- If you see "Page not found", it's not deployed

## Possible Solutions

### If function isn't deployed:

1. **Try creating a simple test function first:**
   - Create `netlify/functions/test.js` with:
     ```javascript
     exports.handler = async (event) => {
       return { statusCode: 200, body: JSON.stringify({ message: 'Hello' }) };
     };
     ```
   - Deploy and test: `https://watchpass.netlify.app/.netlify/functions/test`
   - If this works, the issue is with the `generate-pass.js` file

2. **Check Netlify function requirements:**
   - Functions must export a `handler` function
   - The file structure must match Netlify's expectations

3. **Try deploying via Git:**
   - Push to GitHub
   - Connect repo to Netlify
   - Netlify will auto-deploy functions

Let me know what you see in the Netlify Dashboard!

