export type { FeatureStatus, ExtendedFeatureStatus } from './utils/pricing-evaluator';
export type { PricingAnalytics, AnalyticsOptions } from './services/pricing.service';

export interface CspSolution {
  selected_plan: number;
  selected_addons: number[];
  subscription_features: number[];
  subscription_usage_limits: number[];
  subscription_cost: number;
  features_included_in_selected_addons: number[];
  usage_limits_included_in_selected_addons: number[];
}