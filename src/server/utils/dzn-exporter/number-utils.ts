import { Feature, UsageLimit } from '../../../types';

const unlimitedValue = 100000000;

export function calculateOverriddenRow(items: Record<string, Feature | UsageLimit>): number[] {
  const values = [];
  const defaultValue = 0;

  for (const item of Object.values(items)) {
    let value;

    if (item.valueType === 'NUMERIC' && item.value) {
      value = (item.value as number) > unlimitedValue ? unlimitedValue : item.value as number;
    } else if (item.valueType === 'NUMERIC' && item.defaultValue) {
      value = (item.defaultValue as number) > unlimitedValue ? unlimitedValue : item.defaultValue as number;
    } else if (item.valueType === 'BOOLEAN' && item.value) {
      value = item.value ? 1 : 0;
    } else if (item.valueType === 'BOOLEAN' && item.defaultValue) {
      value = item.defaultValue ? 1 : 0;
    } else if (item.valueType === 'TEXT') {
      value = 1;
    } else {
      value = defaultValue;
    }
    values.push(value);
  }
  return values;
}

export function valueToNumber(value?: string | number | boolean | string[]): number {
  switch (typeof value) {
    case 'boolean':
      return value ? 1 : 0;
    case 'number':
      return value === Infinity ? 1000000000 : value;
    case 'object':
    case 'string':
      return 1;
    case 'undefined':
      return 0;
  }
}
