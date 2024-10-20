import { ValueType, FeatureType, RenderMode } from './types.d.ts';

export interface Feature {
    name: string;
    description?: string;
    valueType: ValueType;
    defaultValue: string | number | boolean;
    value?: string | number | boolean;
    expression?: string;
    serverExpression?: string;
    type: FeatureType;
    render: RenderMode;
}