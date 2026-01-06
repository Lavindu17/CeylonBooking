export interface ListingImage {
    id: string;
    listing_id: string;
    storage_path: string;
    url: string;
    order: number;
    created_at: string;
}

export interface Listing {
    id: string;
    created_at: string;
    host_id: string;
    title: string;
    description: string | null;
    price: number;
    beds: number;
    baths: number;
    image_url: string | null; // Fallback for backward compatibility
    location: string;
    facilities: string[] | null;
    google_maps_url: string | null;
    latitude: number | null;
    longitude: number | null;
    images?: ListingImage[]; // Array of uploaded images
    host?: {
        id: string;
        email: string;
        raw_user_meta_data?: {
            display_name?: string;
            avatar_url?: string;
        };
    };
}

