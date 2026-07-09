/**
 * Centralized validation utilities
 */

export interface ValidationResult {
  success: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== "string") {
    return { success: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Invalid email format" };
  }

  return { success: true };
}

/**
 * Validate phone number (basic validation for Ethiopian format)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== "string") {
    return { success: false, error: "Phone number is required" };
  }

  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, "");
  
  // Ethiopian phone numbers: +251 followed by 9 digits, or 09/07 followed by 8 digits
  const phoneRegex = /^(\+251|0)?[97]\d{8}$/;
  if (!phoneRegex.test(cleaned)) {
    return { success: false, error: "Invalid phone number format" };
  }

  return { success: true };
}

/**
 * Validate name (non-empty string, reasonable length)
 */
export function validateName(name: string, fieldName = "Name"): ValidationResult {
  if (!name || typeof name !== "string") {
    return { success: false, error: `${fieldName} is required` };
  }

  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { success: false, error: `${fieldName} cannot be empty` };
  }

  if (trimmed.length < 2) {
    return { success: false, error: `${fieldName} must be at least 2 characters` };
  }

  if (trimmed.length > 100) {
    return { success: false, error: `${fieldName} must be less than 100 characters` };
  }

  return { success: true };
}

/**
 * Validate price (non-negative number)
 */
export function validatePrice(price: number): ValidationResult {
  if (typeof price !== "number" || isNaN(price)) {
    return { success: false, error: "Price must be a valid number" };
  }

  if (price < 0) {
    return { success: false, error: "Price cannot be negative" };
  }

  if (price > 1000000) {
    return { success: false, error: "Price is too high" };
  }

  return { success: true };
}

/**
 * Validate UUID
 */
export function validateUUID(uuid: string): ValidationResult {
  if (!uuid || typeof uuid !== "string") {
    return { success: false, error: "ID is required" };
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    return { success: false, error: "Invalid ID format" };
  }

  return { success: true };
}

/**
 * Validate date string
 */
export function validateDate(dateString: string): ValidationResult {
  if (!dateString || typeof dateString !== "string") {
    return { success: false, error: "Date is required" };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { success: false, error: "Invalid date format" };
  }

  return { success: true };
}

/**
 * Validate URL
 */
export function validateURL(url: string): ValidationResult {
  if (!url || typeof url !== "string") {
    return { success: false, error: "URL is required" };
  }

  try {
    new URL(url);
    return { success: true };
  } catch {
    return { success: false, error: "Invalid URL format" };
  }
}

/**
 * Sanitize string input (basic XSS prevention)
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";
  
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

/**
 * Validate and sanitize object fields
 */
export function validateAndSanitizeObject(
  obj: Record<string, any>,
  schema: Record<string, (value: any) => ValidationResult>
): { success: boolean; errors: Record<string, string>; sanitized?: Record<string, any> } {
  const errors: Record<string, string> = {};
  const sanitized: Record<string, any> = {};

  for (const [key, validator] of Object.entries(schema)) {
    const value = obj[key];
    const result = validator(value);

    if (!result.success) {
      errors[key] = result.error || `Invalid ${key}`;
    } else {
      // Sanitize string values
      if (typeof value === "string") {
        sanitized[key] = sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true, errors: {}, sanitized };
}
