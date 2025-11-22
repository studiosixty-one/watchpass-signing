# Certificate Storage Solution

The base64 certificate exceeds AWS Lambda's 4KB environment variable limit. Here are solutions:

## Solution 1: Store in Supabase Storage (Recommended)

Store the certificate in Supabase Storage and fetch it at runtime:

1. **Upload certificate to Supabase Storage:**
   - Go to Supabase Dashboard → Storage
   - Create a bucket: `wallet-certificates` (make it private)
   - Upload your `.p12` file
   - Get the file path

2. **Update the function to fetch from Supabase:**
   - Add Supabase client to function
   - Fetch certificate at runtime
   - Cache it in memory (Lambda container reuse)

## Solution 2: Use Netlify's Encrypted Environment Variables

Netlify has encrypted env vars that might have higher limits, but Lambda still has 4KB limit.

## Solution 3: Split Certificate (Not Recommended)

Split the base64 string into chunks, but this is hacky and complex.

## Solution 4: Use a Different Hosting (Vercel, Railway, etc.)

Other platforms might have higher limits:
- Vercel: 4KB limit (same issue)
- Railway: Higher limits
- AWS Lambda directly: Can use Parameter Store or Secrets Manager

## Solution 5: Store Certificate in Code (Not Secure)

Not recommended for production, but for testing you could:
- Store in the function code itself
- But this exposes the certificate in git

## Recommended: Supabase Storage

Let's implement Solution 1 - fetch from Supabase Storage.

