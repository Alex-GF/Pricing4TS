export class PricingTokenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PricingTokenError';
    }
}