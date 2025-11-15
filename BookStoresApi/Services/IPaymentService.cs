using BookStoresApi.DTOs;
using Microsoft.AspNetCore.Http;

namespace BookStoresApi.Services
{
    public interface IPaymentService
    {
        Task<PaymentResponse> CreatePayment(PaymentRequest request);
        Task<object> HandleVnpayReturn(HttpRequest request);
    }
}
