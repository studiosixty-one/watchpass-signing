# Pass Signing Service

This is a Node.js service for properly signing Apple Wallet passes. Since Deno Edge Functions have limitations with PKCS#7 signing, this service handles the actual pass generation and signing.

## Setup Options

### Option 1: Deploy to Vercel (Easiest)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to this directory:
   ```bash
   cd pass-signing-service
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel Dashboard:
   - `APPLE_PASS_TYPE_ID`
   - `APPLE_TEAM_ID`
   - `APPLE_ORG_NAME`
   - `APPLE_PASS_CERT_PASSWORD`
   - `APPLE_PASS_CERT_BASE64`
   - `WWDR_CERT_BASE64` (Apple's WWDR certificate in base64)

5. Update the Supabase Edge Function to call this service (see below)

### Option 2: Deploy to Netlify

Similar to Vercel, but use Netlify CLI and set environment variables in Netlify Dashboard.

### Option 3: Self-hosted

Run as a Node.js/Express server on any hosting platform.

## Required Files

You'll need to download Apple's WWDR (Worldwide Developer Relations) certificate:

1. Download from: https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer
2. Convert to PEM: `openssl x509 -inform DER -in AppleWWDRCAG3.cer -out wwdr.pem`
3. Convert to base64: `base64 -i wwdr.pem | pbcopy`
4. Add as `WWDR_CERT_BASE64` environment variable

## Update Supabase Edge Function

Update `supabase/functions/generate-wallet-pass/index.ts` to proxy to this service:

```typescript
// Instead of signing locally, call the Node.js service
const signingServiceUrl = Deno.env.get('PASS_SIGNING_SERVICE_URL') || 'https://your-service.vercel.app/api/generate-pass'

const response = await fetch(signingServiceUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})

if (!response.ok) {
  throw new Error(`Signing service error: ${response.statusText}`)
}

const passData = await response.arrayBuffer()

return new Response(passData, {
  headers: {
    ...corsHeaders,
    'Content-Type': 'application/vnd.apple.pkpass',
    'Content-Disposition': `attachment; filename="watch-${watch.serialNumber}.pkpass"`
  }
})
```

## Alternative: Use PassSlot or PassKit.com

For a fully managed solution, consider:
- PassSlot (https://www.passslot.com/)
- PassKit.com (https://www.passkit.com/)

These services handle all the complexity for you.

