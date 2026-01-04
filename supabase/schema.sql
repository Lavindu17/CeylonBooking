-- Create listings table
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  host_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  price numeric not null,
  beds integer not null,
  baths integer not null,
  image_url text,
  location text not null,
  facilities text[] default '{}',
  
  -- Google Maps Link (Requested by User)
  google_maps_url text,
  
  -- Coordinates are still required for the App's MapView to render pins at specific locations.
  -- In a real app, you might extract these from the link or address via an API.
  latitude double precision,
  longitude double precision
);

-- Enable Row Level Security (RLS)
alter table public.listings enable row level security;

-- Policy: Everyone can read all listings
create policy "Enable read access for all users"
  on public.listings for select
  using (true);

-- Policy: Users can insert their own listings
create policy "Users can create listings"
  on public.listings for insert
  with check (auth.uid() = host_id);

-- Policy: Users can update their own listings
create policy "Users can update own listings"
  on public.listings for update
  using (auth.uid() = host_id);

-- Policy: Users can delete their own listings
create policy "Users can delete own listings"
  on public.listings for delete
  using (auth.uid() = host_id);

-- Seed Data (Sri Lanka Locations)
insert into public.listings (title, description, price, beds, baths, image_url, location, facilities, google_maps_url, latitude, longitude)
values
  (
    'Ella Mountain View Cabin', 
    'A cozy cabin with stunning views of Ella Rock.', 
    15000, 
    2, 
    1, 
    'https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 
    'Ella', 
    ARRAY['Wifi', 'Hot Water', 'Parking'], 
    'https://maps.app.goo.gl/example1',
    6.8667, 
    81.0467
  ),
  (
    'Mirissa Beachfront Villa', 
    'Direct access to the beach and whale watching.', 
    25000, 
    3, 
    2, 
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 
    'Mirissa', 
    ARRAY['Wifi', 'AC', 'Pool'], 
    'https://maps.app.goo.gl/example2',
    5.9482, 
    80.4716
  ),
  (
    'Kandy Heritage Home', 
    'Traditional Kandyan home near the Temple of the Tooth.', 
    12000, 
    4, 
    2, 
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80', 
    'Kandy', 
    ARRAY['Wifi', 'Parking', 'Kitchen'], 
    'https://maps.app.goo.gl/example3',
    7.2906, 
    80.6337
  ),
  (
    'Colombo Luxury Apartment', 
    'Modern apartment in the heart of the city.', 
    35000, 
    2, 
    2, 
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 
    'Colombo', 
    ARRAY['Wifi', 'AC', 'Pool', 'Gym'], 
    'https://maps.app.goo.gl/example4',
    6.9271, 
    79.8612
  ),
  (
    'Sigiriya Rock Shadow Inn', 
    'Quiet stay within walking distance to Sigiriya/Lion Rock.', 
    8000, 
    1, 
    1, 
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80', 
    'Sigiriya', 
    ARRAY['Wifi', 'Breakfast'], 
    'https://maps.app.goo.gl/example5',
    7.9570, 
    80.7603
  );

-- Create bookings table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  listing_id uuid references public.listings(id) not null,
  user_id uuid references auth.users(id) not null,
  start_date date not null,
  end_date date not null,
  total_price numeric not null,
  status text check (status in ('pending', 'confirmed', 'cancelled')) default 'pending'
);

-- Enable RLS for bookings
alter table public.bookings enable row level security;

-- Policy: Users can see their own bookings
create policy "Users can view own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own bookings
create policy "Users can create bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

-- Policy: Hosts can view bookings for their listings
create policy "Hosts can view bookings for their listings"
  on public.bookings for select
  using (
    exists (
      select 1 from public.listings
      where listings.id = bookings.listing_id
      and listings.host_id = auth.uid()
    )
  );

-- Policy: Hosts can update booking status for their listings
create policy "Hosts can update booking status"
  on public.bookings for update
  using (
    exists (
      select 1 from public.listings
      where listings.id = bookings.listing_id
      and listings.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listings
      where listings.id = bookings.listing_id
      and listings.host_id = auth.uid()
    )
  );
