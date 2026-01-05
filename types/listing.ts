export interface Listing {
    id: string;
    created_at: string;
    host_id: string;
    title: string;
    description: string | null;
    price: number;
    beds: number;
    baths: number;
    image_url: string | null;
    location: string;
    facilities: string[] | null;
    google_maps_url: string | null;
    latitude: number | null;
    longitude: number | null;
    host?: {
        id: string;
        email: string;
        raw_user_meta_data?: {
            display_name?: string;
            avatar_url?: string;
        };
    };
}
