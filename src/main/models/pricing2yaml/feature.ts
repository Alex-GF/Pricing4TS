import { ValueType, FeatureType, RenderMode } from './types';

export type PaymentType = 'CARD' | 'GATEWAY' | 'INVOICE' | 'ACH' | 'WIRE_TRANSFER' | 'OTHER';
export type IntegrationType = 'API' | 'EXTENSION' | 'IDENTITY_PROVIDER' | 'WEB_SAAS' | 'MARKETPLACE' | 'EXTERNAL_DEVICE';
export type AutomationType = 'BOT' | 'FILTERING' | 'TRACKING' | 'TASK_AUTOMATION';
export interface Feature {
  name: string;
  description?: string;
  tag?: string;
  valueType: ValueType;
  defaultValue: string | number | boolean | PaymentType[];
  value?: string | number | boolean | PaymentType[];
  expression?: string;
  serverExpression?: string;
  type: FeatureType;
  integrationType?: IntegrationType;
  pricingUrls?: string[];
  docUrl?: string;
  automationType?: AutomationType;
  render: RenderMode;
}

export function getNumberOfFeatures(features: Record<string, Feature>) {
  return Object.keys(features).length;
}

export function getFeatureNames(features: Record<string, Feature>) {
  return Object.values(features).map(feature => feature.name);
}

export function isIntegrationType(string: string): boolean{
  return (
    string === 'API' ||
    string === 'EXTENSION' ||
    string === 'IDENTITY_PROVIDER' ||
    string === 'WEB_SAAS' ||
    string === 'MARKETPLACE' ||
    string === 'EXTERNAL_DEVICE'
  );
}

export function isAutomationType(string: string): boolean{
  return (
    string === 'BOT' ||
    string === 'FILTERING' ||
    string === 'TRACKING' ||
    string === 'TASK_AUTOMATION'
  );
}

export function isPaymentType(string: string): boolean{
  return (
    string === 'CARD' ||
    string === 'GATEWAY' ||
    string === 'INVOICE' ||
    string === 'ACH' ||
    string === 'WIRE_TRANSFER' ||
    string === 'OTHER'
  );
}
