import { Listing, ListingImage } from '@/types/listing';
import React, { createContext, ReactNode, useContext, useState } from 'react';

export type ListingDraft = {
    id?: string; // Present when editing
    title: string;
    description: string;
    propertyType: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    google_maps_url: string | null;
    beds: number;
    baths: number;
    guests: number;
    facilities: string[];
    images: string[]; // New image URIs (local or to upload)
    existingImages?: ListingImage[]; // Existing images from DB (in edit mode)
    price: number;
};

type ListingCreationContextType = {
    listing: ListingDraft;
    updateListing: (updates: Partial<ListingDraft>) => void;
    resetListing: () => void;
    loadListing: (listing: Listing) => void;
    isEditMode: boolean;
};

const defaultListing: ListingDraft = {
    title: '',
    description: '',
    propertyType: 'Entire place',
    location: '',
    latitude: null,
    longitude: null,
    google_maps_url: null,
    beds: 1,
    baths: 1,
    guests: 2,
    facilities: [],
    images: [],
    price: 0,
};

const ListingCreationContext = createContext<ListingCreationContextType | undefined>(undefined);

export function ListingCreationProvider({ children }: { children: ReactNode }) {
    const [listing, setListing] = useState<ListingDraft>(defaultListing);

    const updateListing = (updates: Partial<ListingDraft>) => {
        setListing(prev => ({ ...prev, ...updates }));
    };

    const resetListing = () => {
        setListing(defaultListing);
    };

    const loadListing = (existingListing: Listing) => {
        setListing({
            id: existingListing.id,
            title: existingListing.title,
            description: existingListing.description || '',
            propertyType: 'Entire place', // Default, not stored in DB currently
            location: existingListing.location,
            latitude: existingListing.latitude,
            longitude: existingListing.longitude,
            google_maps_url: existingListing.google_maps_url,
            beds: existingListing.beds,
            baths: existingListing.baths,
            guests: 2, // Default, not stored in DB currently
            facilities: existingListing.facilities || [],
            images: [], // New images to upload
            existingImages: existingListing.images || [], // Existing images from DB
            price: Number(existingListing.price),
        });
    };

    const isEditMode = !!listing.id;

    return (
        <ListingCreationContext.Provider value={{ listing, updateListing, resetListing, loadListing, isEditMode }}>
            {children}
        </ListingCreationContext.Provider>
    );
}

export function useListingCreation() {
    const context = useContext(ListingCreationContext);
    if (!context) {
        throw new Error('useListingCreation must be used within a ListingCreationProvider');
    }
    return context;
}
