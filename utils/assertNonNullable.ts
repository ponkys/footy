/**
 * Narrows optional value from `T | null | undefined` to `T`
 * Can be used to ensure an important value is not null/undefined, otherwise an
 * error is thrown
 */
export function assertNonNullable<T>(
  value: T,
  error: string = 'Value is nullable'
): NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(error);
  }
  return value as NonNullable<T>;
}
