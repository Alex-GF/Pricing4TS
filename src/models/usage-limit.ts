import { ValueType, UsageLimitType, RenderMode } from "./types.d";

export interface UsageLimit {
    name: string;
    description?: string;
    valueType: ValueType;
    defaultValue: string | number | boolean;
    value?: string | number | boolean;
    unit: string;
    type: UsageLimitType;
    linkedFeatures?: string[];
    render: RenderMode;
}