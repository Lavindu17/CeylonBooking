# Supabase Storage & Database Setup Guide

This guide will walk you through setting up the database and storage for the image upload feature.

## Part 1: Database Schema Setup

### Step 1: Run the SQL Schema

1. Open your **Supabase Dashboard**: https://app.supabase.com
2. Select your **CeylonBooking** project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the contents of `schema_listing_images.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Ctrl/Cmd + Enter)

You should see a success message. This creates:
- ✅ `listing_images` table
- ✅ RLS policies for secure access
- ✅ Indexes for performance
- ✅ `listings_with_images` view for easy querying

---

## Part 2: Supabase Storage Setup

### Step 2: Create Storage Bucket

1. In **Supabase Dashboard**, navigate to **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Configure the bucket:
   - **Name**: `listing-images`
   - **Public bucket**: ✅ **Enable** (so images can be viewed without authentication)
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: Leave empty or add: `image/jpeg,image/png,image/webp`
4. Click **Create bucket**

### Step 3: Configure Storage Policies

After creating the bucket, you need to set up access policies.

1. Click on the **`listing-images`** bucket you just created
2. Go to **Policies** tab
3. Click **New Policy**

#### Policy 1: Public Read Access (Allow anyone to view images)

- **Policy name**: `Public read access`
- **Policy behavior**: `SELECT`
- **Target roles**: `public`
- Click **Review** then **Save policy**

Or use SQL via the SQL Editor:

```sql
-- Allow public read access to all files in listing-images bucket
create policy "Public read access"
on storage.objects for select
using ( bucket_id = 'listing-images' );
```

#### Policy 2: Authenticated Upload (Allow logged-in users to upload)

- **Policy name**: `Authenticated users can upload`
- **Policy behavior**: `INSERT`
- **Target roles**: `authenticated`
- Click **Review** then **Save policy**

Or use SQL:

```sql
-- Allow authenticated users to upload images
create policy "Authenticated users can upload"
on storage.objects for insert
with check (
  bucket_id = 'listing-images' 
  and auth.role() = 'authenticated'
);
```

#### Policy 3: Users Can Delete Their Own Listing Images

- **Policy name**: `Users can delete own listing images`
- **Policy behavior**: `DELETE`
- **Target roles**: `authenticated`

Or use SQL:

```sql
-- Allow users to delete images for their own listings
-- The storage path will be: listing-images/{listing_id}/{filename}
create policy "Users can delete own listing images"
on storage.objects for delete
using (
  bucket_id = 'listing-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Part 3: Verify Setup

### Test Database Schema

Run this query in the SQL Editor to verify the table exists:

```sql
select * from public.listing_images limit 1;
```

You should see an empty result (no rows yet) but no errors.

### Test Storage Policies

1. Navigate to **Storage** > **listing-images**
2. Try uploading a test image manually via the dashboard
3. You should see the file appear in the bucket
4. Copy the public URL and open it in a browser - it should display the image

---

## Part 4: Quick Reference

### Storage Bucket Details

- **Bucket Name**: `listing-images`
- **Access**: Public read, authenticated write
- **Path Structure**: `listing-images/{listing_id}/{image_filename}`
- **Max File Size**: 5MB per image

### Database Tables

- **listing_images**: Stores image metadata (URLs, order, etc.)
- **listings**: Existing table (no changes needed)

### Getting Public URLs (for reference)

In your code, you'll use:

```typescript
const { data } = supabase.storage
  .from('listing-images')
  .getPublicUrl(storagePath);
  
const publicUrl = data.publicUrl;
```

---

## Troubleshooting

### Issue: "Permission denied" when uploading

**Solution**: Make sure you're authenticated and the upload policy is created correctly.

### Issue: Images not displaying

**Solution**: 
1. Verify the bucket is public
2. Check the public read policy exists
3. Verify the URL is correct (should start with your Supabase project URL)

### Issue: SQL errors when running schema

**Solution**: 
1. Make sure you have `listings` table already created (from `schema.sql`)
2. Check if `listing_images` table already exists - if so, drop it first:
   ```sql
   drop table if exists public.listing_images cascade;
   ```

---

## Next Steps

After completing this setup:

1. ✅ Database table is ready
2. ✅ Storage bucket is configured
3. ✅ Policies are in place

You can now proceed with implementing the image upload functionality in the app code!
