export function validate(schema) {
  return (req, res, next) => {
    // Validate body, query, and params with Zod before controller runs.
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    // Store cleaned/converted values here, for example id becomes a number.
    req.validated = parsed;
    next();
  };
}
