# Quick Fix: Add WWDR Certificate

The pass validation error is because the **WWDR certificate is missing**. Here's how to fix it:

## Step 1: Add WWDR Certificate to Netlify

1. Go to: https://app.netlify.com/sites/watchpass/settings/env
2. Click **Add a variable**
3. **Name**: `WWDR_CERT_BASE64`
4. **Value**: Run this command to get it:

```bash
base64 -i /tmp/wwdr.pem
```

Copy the entire output (it's a long string starting with `LS0tLS1CRUdJTi...`)

5. Paste it into the **Value** field
6. Click **Create variable**

## Step 2: Wait for Redeploy

Netlify will automatically redeploy after you add the variable (usually takes 1-2 minutes).

## Step 3: Test Again

1. Build and run your app on your device
2. Tap "Add to Apple Wallet"
3. The pass should now be accepted! ✅

## What This Fixes

Apple Wallet requires the WWDR (Worldwide Developer Relations) intermediate certificate to be included in the PKCS#7 signature. Without it, Apple can't validate the certificate chain and rejects the pass.

## Alternative: Manual Download

If the command above doesn't work:

1. Download: https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer
2. Convert: `openssl x509 -inform DER -in AppleWWDRCAG3.cer -out wwdr.pem`
3. Base64: `base64 -i wwdr.pem | pbcopy`
4. Add to Netlify as `WWDR_CERT_BASE64`

---

**After adding the WWDR certificate, the pass should work!** 🎉

