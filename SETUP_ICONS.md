# Setting Up Pass Icons in Supabase Storage

This guide explains how to upload your custom pass icons to Supabase Storage so they're used in your Apple Wallet passes.

## Required Icon Sizes

Apple Wallet requires three icon sizes:
- **icon.png**: 29x29 pixels
- **icon@2x.png**: 58x58 pixels  
- **icon@3x.png**: 87x87 pixels

All icons must be PNG format with transparency support.

## Step 1: Create Your Icons

1. Design your icons at the required sizes (29x29, 58x58, 87x87)
2. Export as PNG files with transparency
3. Name them exactly:
   - `icon.png`
   - `icon@2x.png`
   - `icon@3x.png`

## Step 2: Create Storage Bucket (if not exists)

1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. Click **New bucket**
4. Name it: `wallet-assets`
5. Set it to **Public** (or create a policy for service role access)
6. Click **Create bucket**

## Step 3: Create Icons Folder

1. In the `wallet-assets` bucket, click **New folder**
2. Name it: `icons`
3. Click **Create folder**

## Step 4: Upload Icons

1. Navigate to `wallet-assets/icons/`
2. Click **Upload file**
3. Upload all three icon files:
   - `icon.png`
   - `icon@2x.png`
   - `icon@3x.png`
4. Wait for uploads to complete

## Step 5: Set Storage Policy (if bucket is private)

If your bucket is private, you need to allow the service role to read icons:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL:

```sql
-- Allow service role to read icons
CREATE POLICY "Service role can read icons"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'wallet-assets' AND (storage.foldername(name))[1] = 'icons');
```

## Step 6: Set Environment Variable (Optional)

The function will use the default path `wallet-assets/icons` if you don't set this.

If your icons are in a different location, set this in Netlify:

1. Go to **Site settings** → **Environment variables**
2. Add:
   - **Key**: `ICONS_STORAGE_PATH`
   - **Value**: `wallet-assets/icons` (or your custom path)
3. Click **Save**

## Step 7: Redeploy Function

The function will automatically use the icons on the next request. If you want to force a redeploy:

1. Go to **Deploys** in Netlify
2. Click **Trigger deploy** → **Deploy site**

## Verification

After deployment, test your pass generation. The function will:
1. Try to fetch icons from Supabase Storage
2. If found, use your custom icons
3. If not found, fall back to gray placeholder icons

Check the Netlify function logs to see if icons are being fetched successfully.

## Troubleshooting

**Icons not showing:**
- Verify icons are uploaded to the correct path
- Check bucket is public OR policy allows service role access
- Check Netlify function logs for fetch errors
- Verify `ICONS_STORAGE_PATH` environment variable matches your folder structure

**Wrong icons showing:**
- Clear the icon cache by waiting 5 minutes (cache duration)
- Or redeploy the function to clear cache

