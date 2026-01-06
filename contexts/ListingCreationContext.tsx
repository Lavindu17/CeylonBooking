import React, { createContext, ReactNode, useContext, useState } from 'react';

export type ListingDraft = {
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
    images: string[];
    price: number;
};

type ListingCreationContextType = {
    listing: ListingDraft;
    updateListing: (updates: Partial<ListingDraft>) => void;
    resetListing: () => void;
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

    return (
        <ListingCreationContext.Provider value={{ listing, updateListing, resetListing }}>
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
