# Deploy Function via Netlify UI

Since the CLI deployment is having issues, here's how to deploy via the Netlify UI:

## Option 1: Connect to Git Repository (Recommended)

1. Go to: https://app.netlify.com/sites/watchpass/settings/deploys
2. Under **Build & deploy**, click **Link repository**
3. Connect your GitHub/GitLab/Bitbucket account
4. Select the repository (or create one with the `pass-signing-service` folder)
5. Set build settings:
   - **Base directory**: `pass-signing-service` (if repo root) or leave blank
   - **Build command**: (leave blank - no build needed)
   - **Publish directory**: `.` (or leave blank)
6. Under **Environment variables**, make sure all 5 variables are set
7. Click **Deploy site**

## Option 2: Manual Deploy via Drag & Drop

1. Go to: https://app.netlify.com/sites/watchpass/deploys
2. Look for **Deploy manually** section
3. Or go to: https://app.netlify.com/drop
4. Drag and drop the `pass-signing-service` folder
5. This will create a new site, so you'll need to:
   - Copy the site ID
   - Update the site settings to use the same domain

## Option 3: Use Netlify CLI with Correct Path

Try this from the project root:

```bash
cd /Users/scott/Desktop/WatchPass-main
npx netlify deploy --prod --dir=pass-signing-service --functions=pass-signing-service/netlify/functions
```

## Option 4: Check if Function Needs to be in Root

Netlify might expect functions in a specific location. Try:

1. Create a `netlify` folder in the repo root (if deploying from repo)
2. Or ensure the `netlify.toml` is in the root of what you're deploying

## Quick Check: Verify Function File

Make sure the function file exists and is correct:

```bash
cd /Users/scott/Desktop/WatchPass-main/pass-signing-service
ls -la netlify/functions/generate-pass.js
cat netlify/functions/generate-pass.js | head -20
```

## Alternative: Use Netlify's Function UI

1. Go to: https://app.netlify.com/sites/watchpass/functions
2. Click **Add function** or **Deploy function**
3. Upload or paste the function code
4. Set environment variables

Let me know which option works for you!

