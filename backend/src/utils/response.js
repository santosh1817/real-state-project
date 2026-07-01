export function successResponse(data = null) {
  // All successful API responses use the same wrapper.
  return {
    success: true,
    data
  };
}
