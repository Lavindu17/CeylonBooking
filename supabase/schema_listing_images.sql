-- Create listing_images table for storing multiple images per listing
create table public.listing_images (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  storage_path text not null, -- Path in Supabase Storage
  url text not null, -- Public URL to the image
  "order" integer not null default 0, -- Display order (0 = cover image)
  
  -- Ensure unique ordering per listing
  unique(listing_id, "order")
);

-- Create index for efficient queries
create index listing_images_listing_id_idx on public.listing_images(listing_id);
create index listing_images_order_idx on public.listing_images("order");

-- Enable Row Level Security (RLS)
alter table public.listing_images enable row level security;

-- Policy: Everyone can read all listing images
create policy "Enable read access for all users"
  on public.listing_images for select
  using (true);

-- Policy: Users can insert images for their own listings
create policy "Users can insert images for own listings"
  on public.listing_images for insert
  with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
      and listings.host_id = auth.uid()
    )
  );

-- Policy: Users can update images for their own listings
create policy "Users can update images for own listings"
  on public.listing_images for update
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
      and listings.host_id = auth.uid()
    )
  );

-- Policy: Users can delete images for their own listings
create policy "Users can delete images for own listings"
  on public.listing_images for delete
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
      and listings.host_id = auth.uid()
    )
  );

-- Optional: Create a view to get listings with their images
create or replace view listings_with_images as
select 
  l.*,
  coalesce(
    json_agg(
      json_build_object(
        'id', li.id,
        'url', li.url,
        'order', li."order"
      ) order by li."order"
    ) filter (where li.id is not null),
    '[]'::json
  ) as images
from public.listings l
left join public.listing_images li on li.listing_id = l.id
group by l.id;
