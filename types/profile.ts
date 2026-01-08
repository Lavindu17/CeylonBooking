// User profile type for bank account details and other profile information
export interface UserProfile {
    id: string;
    created_at: string;
    updated_at: string;

    // Bank account details (for hosts)
    bank_name?: string;
    account_number?: string;
    account_holder?: string;
    branch?: string;

    // Additional profile info
    phone?: string;
    bio?: string;
    profile_image_url?: string;
}

// Bank account details specifically
export interface BankDetails {
    bank_name: string;
    account_number: string;
    account_holder: string;
    branch: string;
}
