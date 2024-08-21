export const isDefined = <T>(v: T | undefined | null): v is T =>
  v !== undefined && v !== null;

export const isFulfilled = <T>(
  value: PromiseSettledResult<T>,
): value is PromiseFulfilledResult<T> => {
  return value.status === "fulfilled";
};

export const _isRejected = <T>(
  value: PromiseSettledResult<T>,
): value is PromiseRejectedResult => {
  return value.status === "rejected";
};
