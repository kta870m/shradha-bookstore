namespace BookStoresApi.Constants
{
    public static class CurrencyConstants
    {
        /// <summary>
        /// Tỷ giá quy đổi từ USD sang VND
        /// Cập nhật định kỳ theo tỷ giá thực tế
        /// </summary>
        public const decimal USD_TO_VND_RATE = 25000m;

        /// <summary>
        /// Đơn vị tiền tệ mặc định trong hệ thống
        /// </summary>
        public const string DEFAULT_CURRENCY = "USD";

        /// <summary>
        /// Đơn vị tiền tệ cho VNPay
        /// </summary>
        public const string VNPAY_CURRENCY = "VND";

        /// <summary>
        /// Chuyển đổi USD sang VND
        /// </summary>
        /// <param name="usdAmount">Số tiền USD</param>
        /// <returns>Số tiền VND (đã làm tròn)</returns>
        public static long ConvertUsdToVnd(decimal usdAmount)
        {
            return (long)Math.Round(usdAmount * USD_TO_VND_RATE);
        }

        /// <summary>
        /// Chuyển đổi số tiền VND sang định dạng VNPay (amount * 100)
        /// </summary>
        /// <param name="vndAmount">Số tiền VND</param>
        /// <returns>Số tiền theo định dạng VNPay</returns>
        public static long ConvertToVnpayAmount(long vndAmount)
        {
            return vndAmount * 100;
        }

        /// <summary>
        /// Chuyển đổi USD sang định dạng VNPay amount trong một bước
        /// </summary>
        /// <param name="usdAmount">Số tiền USD</param>
        /// <returns>Số tiền theo định dạng VNPay</returns>
        public static long ConvertUsdToVnpayAmount(decimal usdAmount)
        {
            long vndAmount = ConvertUsdToVnd(usdAmount);
            return ConvertToVnpayAmount(vndAmount);
        }
    }
}
