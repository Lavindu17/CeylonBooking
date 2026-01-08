/**
 * Payment utility functions for booking payment verification flow
 */

/**
 * Calculate advance payment amount (25% of total booking price)
 * @param totalPrice - Total booking price in LKR
 * @returns Advance payment amount (rounded to nearest rupee)
 */
export function calculateAdvancePayment(totalPrice: number): number {
    return Math.round(totalPrice * 0.25);
}

/**
 * Format bank account number for display (mask middle digits)
 * @param accountNumber - Full account number
 * @returns Masked account number (e.g., "1234****7890")
 */
export function formatAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 8) return accountNumber;

    const start = accountNumber.slice(0, 4);
    const end = accountNumber.slice(-4);
    const middle = '*'.repeat(Math.min(accountNumber.length - 8, 4));

    return `${start}${middle}${end}`;
}

/**
 * Validate bank account details
 * @param bankDetails - Bank account information
 * @returns True if all required fields are present
 */
export function validateBankDetails(bankDetails: {
    bank_name?: string;
    account_number?: string;
    account_holder?: string;
    branch?: string;
}): boolean {
    return !!(
        bankDetails.bank_name?.trim() &&
        bankDetails.account_number?.trim() &&
        bankDetails.account_holder?.trim() &&
        bankDetails.branch?.trim()
    );
}

/**
 * Get payment instructions text
 * @param advanceAmount - Advance payment amount
 * @param bankDetails - Host's bank account details
 * @returns Formatted payment instructions
 */
export function getPaymentInstructions(
    advanceAmount: number,
    bankDetails: {
        bank_name: string;
        account_number: string;
        account_holder: string;
        branch: string;
    }
): string {
    return `Please transfer LKR ${advanceAmount.toLocaleString()} to the following bank account:

Bank: ${bankDetails.bank_name}
Account Number: ${bankDetails.account_number}
Account Holder: ${bankDetails.account_holder}
Branch: ${bankDetails.branch}

After completing the transfer, upload the payment receipt in your booking details to confirm your reservation.`;
}
