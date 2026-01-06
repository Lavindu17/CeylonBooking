-- Check if images were saved to database
SELECT 
    l.id,
    l.title,
    l.image_url,
    li.id as image_id,
    li.url as image_url,
    li."order",
    li.created_at
FROM listings l
LEFT JOIN listing_images li ON li.listing_id = l.id
WHERE l.created_at > NOW() - INTERVAL '1 hour'
ORDER BY l.created_at DESC, li."order" ASC
LIMIT 20;

-- Check if there are any images in listing_images table
SELECT COUNT(*) as total_images, listing_id
FROM listing_images
GROUP BY listing_id
ORDER BY listing_id DESC;
