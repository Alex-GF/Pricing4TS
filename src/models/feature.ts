import { ValueType, FeatureType, RenderMode } from './types.d';

export type PaymentType = "CARD" | "GATEWAY" | "INVOICE" | "ACH" | "WIRE_TRANSFER" | "OTHER";
export interface Feature {
    name: string;
    description?: string;
    valueType: ValueType;
    defaultValue: string | number | boolean | string[];
    value?: string | number | boolean | string[];
    expression?: string;
    serverExpression?: string;
    type: FeatureType;
    render: RenderMode;
}