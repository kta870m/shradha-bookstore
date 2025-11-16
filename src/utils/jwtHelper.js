/**
 * Decode JWT token without verification (for client-side use only)
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload or null if invalid
 */
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (second part)
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if user is admin from JWT token
 * @param {string} token - JWT token
 * @returns {boolean} True if user is admin
 */
export const isAdmin = (token) => {
  const payload = decodeJWT(token);
  if (!payload) return false;
  
  // Check user_type claim (case insensitive)
  const userType = payload.user_type || payload.userType || '';
  return userType.toLowerCase() === 'admin';
};

/**
 * Get user info from JWT token
 * @param {string} token - JWT token
 * @returns {object|null} User info or null
 */
export const getUserFromToken = (token) => {
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  return {
    id: payload.sid,
    email: payload.email,
    username: payload.sub,
    fullName: payload.full_name || payload.fullName,
    userType: payload.user_type || payload.userType,
  };
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
};
