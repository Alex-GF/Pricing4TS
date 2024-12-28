export class PricingPlanEvaluationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PricingPlanEvaluationError';
    }
}