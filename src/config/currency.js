// Currency conversion configuration
export const CURRENCY_CONFIG = {
  USD_TO_VND_RATE: 25000,
  DEFAULT_CURRENCY: 'USD',
  PAYMENT_CURRENCY: 'VND'
};

/**
 * Convert USD to VND
 * @param {number} usdAmount - Amount in USD
 * @returns {number} Amount in VND
 */
export const convertUsdToVnd = (usdAmount) => {
  return Math.round(usdAmount * CURRENCY_CONFIG.USD_TO_VND_RATE);
};

/**
 * Format VND amount with locale
 * @param {number} vndAmount - Amount in VND
 * @returns {string} Formatted VND string
 */
export const formatVnd = (vndAmount) => {
  return vndAmount.toLocaleString('vi-VN') + ' ₫';
};

/**
 * Format USD amount
 * @param {number} usdAmount - Amount in USD
 * @returns {string} Formatted USD string
 */
export const formatUsd = (usdAmount) => {
  return '$' + usdAmount.toFixed(2);
};
