export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  // Normalize different RTK Query/backend error shapes into one readable message.
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error.data?.message) return error.data.message;
  if (error.data?.issues?.length) return error.data.issues[0].message;
  if (error.error) return error.error;
  return fallback;
}
