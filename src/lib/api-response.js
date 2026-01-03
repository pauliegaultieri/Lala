import { NextResponse } from "next/server";

/**
 * Standardized error response for API routes
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 500)
 * @param {*} details - Optional additional error details
 * @returns {NextResponse}
 */
export function errorResponse(message, status = 500, details = null) {
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };

  if (details) {
    response.details = details;
  }

  return NextResponse.json(response, { status });
}

/**
 * Standardized success response for API routes
 * @param {*} data - Response data
 * @param {number} status - HTTP status code (default: 200)
 * @returns {NextResponse}
 */
export function successResponse(data, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Standardized validation error response
 * @param {Array|Object} errors - Validation errors
 * @returns {NextResponse}
 */
export function validationErrorResponse(errors) {
  return NextResponse.json(
    {
      success: false,
      error: "Validation failed",
      errors: Array.isArray(errors) ? errors : [errors],
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
}

/**
 * Standardized unauthorized response
 * @param {string} message - Optional custom message
 * @returns {NextResponse}
 */
export function unauthorizedResponse(message = "Authentication required") {
  return NextResponse.json(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}

/**
 * Standardized forbidden response
 * @param {string} message - Optional custom message
 * @returns {NextResponse}
 */
export function forbiddenResponse(message = "Access forbidden") {
  return NextResponse.json(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status: 403 }
  );
}

/**
 * Standardized not found response
 * @param {string} resource - Resource type that was not found
 * @returns {NextResponse}
 */
export function notFoundResponse(resource = "Resource") {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} not found`,
      timestamp: new Date().toISOString(),
    },
    { status: 404 }
  );
}
