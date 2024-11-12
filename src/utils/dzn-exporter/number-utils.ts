import { Feature, UsageLimit } from '../../main';

export function calculateOverriddenRow(items: Feature[] | UsageLimit[]): number[] {
  const values = [];
  const defaultValue = 0;

  for (let i = 0; i < items.length; i++) {
    let value;
    if (items[i].valueType === 'NUMERIC' && items[i].value) {
      value = items[i].value as number;
    } else if (items[i].valueType === 'NUMERIC' && items[i].defaultValue) {
      value = items[i].defaultValue as number;
    } else if (items[i].valueType === 'BOOLEAN' && items[i].value) {
      value = items[i].value ? 1 : 0;
    } else if (items[i].valueType === 'BOOLEAN' && items[i].defaultValue) {
      value = items[i].defaultValue ? 1 : 0;
    } else if (items[i].valueType === 'TEXT') {
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
      return value;
    case 'object':
    case 'string':
      return 1;
    case 'undefined':
      return 0;
  }
}
