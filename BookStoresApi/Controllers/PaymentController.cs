using BookStoresApi.DTOs;
using BookStoresApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BookStoresApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        /// <summary>
        /// Tạo URL thanh toán VNPay
        /// </summary>
        /// <param name="request">OrderId và ReturnUrl</param>
        /// <returns>URL để redirect đến VNPay</returns>
        [HttpPost("create")]
        public async Task<ActionResult<PaymentResponse>> CreatePayment([FromBody] PaymentRequest request)
        {
            try
            {
                var response = await _paymentService.CreatePayment(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xử lý callback từ VNPay và xác thực với VNPay Query API
        /// </summary>
        /// <returns>Kết quả thanh toán chi tiết từ VNPay</returns>
        [HttpGet("vnpay-return")]
        public async Task<IActionResult> HandleVnpayReturn()
        {
            try
            {
                var result = await _paymentService.HandleVnpayReturn(Request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
