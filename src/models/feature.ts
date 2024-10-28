import { ValueType, FeatureType, RenderMode } from './types';

export type PaymentType = "CARD" | "GATEWAY" | "INVOICE" | "ACH" | "WIRE_TRANSFER" | "OTHER";
export interface Feature {
    name: string;
    description?: string;
    tag?: string
    valueType: ValueType;
    defaultValue: string | number | boolean | string[];
    value?: string | number | boolean | string[];
    expression?: string;
    serverExpression?: string;
    type: FeatureType;
    render: RenderMode;
}