# Deploy Function via Netlify UI

Since the CLI has path resolution issues, here's how to deploy the function via the Netlify UI:

## Option 1: Connect to Git Repository (Recommended - Easiest)

This is the most reliable way:

1. **Create a GitHub repository:**
   - Go to GitHub and create a new repo (e.g., `watchpass-signing-service`)
   - Don't initialize with README

2. **Push your code:**
   ```bash
   cd /Users/scott/Desktop/WatchPass-main/pass-signing-service
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/watchpass-signing-service.git
   git push -u origin main
   ```

3. **Connect to Netlify:**
   - Go to: https://app.netlify.com/sites/watchpass/settings/deploys
   - Click **Link repository**
   - Connect your GitHub account
   - Select the `watchpass-signing-service` repository
   - Set build settings:
     - **Base directory**: (leave blank - repo root)
     - **Build command**: (leave blank)
     - **Publish directory**: `.`
   - Click **Deploy site**

4. **Netlify will automatically:**
   - Detect the `netlify/functions` directory
   - Deploy the function
   - Use your environment variables

## Option 2: Manual Function Upload (If Available)

Some Netlify plans allow manual function uploads:

1. Go to: https://app.netlify.com/sites/watchpass/functions
2. Look for an "Upload function" or "Add function" button
3. If available, upload `netlify/functions/generate-pass.js`

## Option 3: Use Netlify CLI with Absolute Path

Try this workaround:

```bash
cd /Users/scott/Desktop/WatchPass-main/pass-signing-service
NETLIFY_FUNCTIONS_DIR="$(pwd)/netlify/functions" npx netlify deploy --prod
```

## Option 4: Create a Minimal Git Repo

If you don't want to use GitHub, you can:

1. Initialize git in the directory:
   ```bash
   cd /Users/scott/Desktop/WatchPass-main/pass-signing-service
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Then try deploying again - sometimes having git initialized helps

## Quick Check: Verify Function Structure

The function file should:
- Be at: `netlify/functions/generate-pass.js`
- Export `exports.handler`
- Be a valid Node.js file

Let's verify:
```bash
cd /Users/scott/Desktop/WatchPass-main/pass-signing-service
head -15 netlify/functions/generate-pass.js | grep -E "(exports|handler)"
```

Should show: `exports.handler = async (event, context) => {`

## Recommended: Use Option 1 (Git)

Connecting to Git is the most reliable way and will:
- Auto-deploy on every push
- Properly detect functions
- Use environment variables correctly
- Give you deployment history

Let me know which option you'd like to try!

