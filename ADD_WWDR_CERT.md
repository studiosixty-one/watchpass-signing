# Add WWDR Certificate to Fix Pass Validation

The pass is being rejected because the **WWDR (Worldwide Developer Relations) intermediate certificate** is missing from the PKCS#7 signature.

## Quick Fix

### Step 1: Download WWDR Certificate

I'll download it for you, or you can:
1. Go to: https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer
2. Download the file

### Step 2: Convert to Base64

```bash
# Convert .cer to PEM
openssl x509 -inform DER -in AppleWWDRCAG3.cer -out wwdr.pem

# Convert to base64
base64 -i wwdr.pem | pbcopy
```

### Step 3: Add to Netlify Environment Variables

1. Go to: https://app.netlify.com/sites/watchpass/settings/env
2. Click **Add a variable**
3. **Name**: `WWDR_CERT_BASE64`
4. **Value**: (paste the base64 string from Step 2)
5. Click **Create variable**

### Step 4: Redeploy

After adding the variable, Netlify will auto-redeploy, or trigger manually.

## Why This Is Needed

Apple Wallet requires the WWDR intermediate certificate to be included in the PKCS#7 signature to validate the certificate chain. Without it, the pass is rejected as invalid.

## Test After Adding

1. Wait for deployment to complete
2. Test in your app again
3. The pass should now be accepted by Apple Wallet ✅

