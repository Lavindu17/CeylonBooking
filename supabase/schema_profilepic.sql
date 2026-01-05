-- =====================================================
-- PROFILE PICTURE STORAGE SETUP
-- =====================================================
-- This schema sets up Supabase Storage for user profile pictures.
-- Run this AFTER creating the 'avatars' bucket in the Supabase Dashboard.

-- =====================================================
-- STORAGE BUCKET POLICIES
-- =====================================================
-- These policies control who can upload, update, and view profile pictures.

-- Policy 1: Users can upload their own avatar
-- Allows authenticated users to INSERT files into their own folder
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can update their own avatar  
-- Allows authenticated users to UPDATE files in their own folder
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can delete their own avatar
-- Allows authenticated users to DELETE files in their own folder
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Anyone can view avatars
-- Allows public READ access to all avatar images
-- This is necessary so profile pictures can be displayed in the app
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- =====================================================
-- HELPER FUNCTION (OPTIONAL)
-- =====================================================
-- Function to get the public URL for a user's avatar
-- Usage: SELECT get_avatar_url(auth.uid());

CREATE OR REPLACE FUNCTION public.get_avatar_url(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    avatar_path text;
    public_url text;
BEGIN
    -- Construct the avatar path
    avatar_path := user_id::text || '/avatar.jpg';
    
    -- Check if the file exists in storage
    IF EXISTS (
        SELECT 1 FROM storage.objects 
        WHERE bucket_id = 'avatars' 
        AND name = avatar_path
    ) THEN
        -- Return the public URL
        -- Note: Replace 'YOUR_PROJECT_REF' with your actual Supabase project reference
        -- Or construct it dynamically in your application code
        RETURN 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/avatars/' || avatar_path;
    ELSE
        -- Return null if no avatar exists
        RETURN NULL;
    END IF;
END;
$$;

-- =====================================================
-- NOTES FOR IMPLEMENTATION
-- =====================================================
-- 
-- Storage Path Format:
--   avatars/{user_id}/avatar.jpg
--
-- Example:
--   avatars/a1b2c3d4-e5f6-7890-abcd-ef1234567890/avatar.jpg
--
-- In your application code, construct the upload path as:
--   const filePath = `${user.id}/avatar.jpg`;
--
-- To get the public URL after upload:
--   const { data } = supabase.storage
--     .from('avatars')
--     .getPublicUrl(filePath);
--   const avatarUrl = data.publicUrl;
--
-- Store the avatarUrl in user metadata:
--   await supabase.auth.updateUser({
--     data: { avatar_url: avatarUrl }
--   });
--
-- =====================================================
