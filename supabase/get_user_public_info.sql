-- =====================================================
-- RPC FUNCTION TO GET USER PUBLIC INFO
-- =====================================================
-- This function allows fetching basic user information
-- from auth.users for displaying host details

CREATE OR REPLACE FUNCTION public.get_user_public_info(user_id uuid)
RETURNS TABLE (
    id uuid,
    email text,
    display_name text,
    avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id,
        au.email::text,
        (au.raw_user_meta_data->>'display_name')::text as display_name,
        (au.raw_user_meta_data->>'avatar_url')::text as avatar_url
    FROM auth.users au
    WHERE au.id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_public_info(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_public_info(uuid) TO anon;
