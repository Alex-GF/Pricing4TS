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
  automationType?: AutomationType;
  render: RenderMode;
}

export interface ContainerFeatures{
  [key: string]: Feature;
}

export function getNumberOfFeatures(features: Feature[]) {
  return features.length;
}

export function getFeatureNames(features: Feature[]) {
  return features.map(feature => feature.name);
}
