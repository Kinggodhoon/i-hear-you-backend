import { plainToInstance, Transform } from 'class-transformer';

export function JsonParse(targetType: any) {
  return Transform(({ value }) => {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      try {
        const parsedValue = JSON.parse(value);
        return plainToInstance(targetType, parsedValue);
      } catch {
        return {};
      }
    }

    return plainToInstance(targetType, value);
  });
}
