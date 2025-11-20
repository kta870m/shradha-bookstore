import React, { useState } from "react";
import "./Faqs.css"; //  import file CSS riêng để styling giao diện

//  Dữ liệu FAQ: mỗi phần gồm câu hỏi và câu trả lời
const faqsData = [
  {
    question: "How can I place an order?",
    answer:
      "You can browse our categories, select your favorite books, and add them to your cart. Once done, go to the cart page and click 'Checkout'.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept payments via credit/debit cards, PayPal, and bank transfer. Cash on delivery is also available for local orders.",
  },
  {
    question: "How long will it take to receive my order?",
    answer:
      "Delivery times vary by location. Local orders typically arrive within 2–5 business days, while international shipping may take 7–14 days.",
  },
  {
    question: "Can I return or exchange a book?",
    answer:
      "Yes, you can return or exchange any book within 7 days of receiving your order, provided it is in its original condition.",
  },
  {
    question: "Do you offer discounts for bulk orders?",
    answer:
      "Yes, we offer special discounts for bulk or institutional purchases. Please contact us for more details.",
  },
];

const Faqs = () => {
  //  openIndex lưu lại mục FAQ nào đang được mở; null nghĩa là tất cả đều đóng
  const [openIndex, setOpenIndex] = useState(null);

  //  Hàm toggleFAQ: nếu click vào mục đang mở → đóng lại; nếu click mục khác → mở mục đó
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faqs-container"> {/*  Container tổng của phần FAQs */}
      <h1 className="faqs-title">Frequently Asked Questions</h1>

      <div className="faqs-list"> {/*  Danh sách các FAQ */}
        {faqsData.map((faq, index) => (
          <div key={index} className="faq-item"> {/*  Mỗi câu hỏi FAQ */}
            <button
              className="faq-question" //  Nút bấm hiển thị câu hỏi
              onClick={() => toggleFAQ(index)} //  Khi click sẽ mở/đóng trả lời
            >
              <span>{faq.question}</span>
              <span className="faq-icon">
                {openIndex === index ? "−" : "+"} {/*  Icon thay đổi khi mở/đóng */}
              </span>
            </button>

            {/*  Phần câu trả lời: nếu openIndex === index → thêm class "open" để hiện */}
            <div
              className={`faq-answer ${openIndex === index ? "open" : ""}`}
            >
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faqs;
