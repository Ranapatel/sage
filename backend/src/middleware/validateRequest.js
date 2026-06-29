/**
 * Request Validation Helper
 *
 * Provides a standardized express-validator error handler and
 * a lightweight Zod-based body validator middleware factory.
 */

const { validationResult } = require('express-validator')

/**
 * Express middleware that returns 400 if any express-validator
 * errors are present on the request.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error:   'Validation failed',
      details: errors.array().map(e => ({ field: e.path || e.param, message: e.msg })),
    })
  }
  next()
}

/**
 * Factory that creates an Express middleware using a Zod schema.
 * Validates req.body and returns 400 with structured errors on failure.
 *
 * @param {import('zod').ZodSchema} schema
 */
function zodValidate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const details = result.error.errors.map(e => ({
        field:   e.path.join('.'),
        message: e.message,
      }))
      return res.status(400).json({
        success: false,
        error:   'Validation failed',
        details,
      })
    }
    req.validatedBody = result.data
    next()
  }
}

module.exports = { handleValidationErrors, zodValidate }
