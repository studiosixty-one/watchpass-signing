# Fix: Pass Validation Error

The pass is being rejected because the PKCS#7 signature is missing the **WWDR (Worldwide Developer Relations) intermediate certificate**.

## The Problem

Apple Wallet requires:
1. ✅ Your Pass Type ID certificate (we have this)
2. ❌ WWDR intermediate certificate (missing!)
3. ✅ Proper PKCS#7 detached signature format

## Solution: Add WWDR Certificate

### Step 1: Download WWDR Certificate

1. Download from Apple: https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer
2. Or use the latest: https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer

### Step 2: Convert to PEM and Store

1. Convert .cer to PEM:
   ```bash
   openssl x509 -inform DER -in AppleWWDRCAG3.cer -out wwdr.pem
   ```

2. Convert to base64:
   ```bash
   base64 -i wwdr.pem | pbcopy
   ```

3. Add to Netlify environment variables:
   - Go to: https://app.netlify.com/sites/watchpass/settings/env
   - Add: `WWDR_CERT_BASE64` = (paste base64 string)

### Step 3: Update Function to Include WWDR

The function needs to be updated to include the WWDR certificate in the PKCS#7 signature.

## Alternative: Use passkit-generator Library

The `passkit-generator` library handles all of this automatically. However, it requires:
- Pass template files
- More complex setup

## Quick Fix: Try Different Signing Options

I've updated the code to use detached signature. Let's test this first, then add WWDR if needed.

## Check Function Logs

Check Netlify function logs for any signing errors:
1. Go to: https://app.netlify.com/sites/watchpass/functions
2. Click on `generate-pass`
3. View logs to see if there are any errors

## Next Steps

1. **Redeploy** the updated function
2. **Test again** on your device
3. If still failing, **add WWDR certificate** (Step 2 above)
4. **Update function** to include WWDR in signature

