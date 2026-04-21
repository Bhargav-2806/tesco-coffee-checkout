// axios is a small HTTP client we use to talk to the Go backend
import axios from 'axios';

// Empty baseURL => requests go to the same host that served the page
// In dev, Vite proxies /api/* to go-api. In prod, nginx proxies /api/* to go-api.
const api = axios.create({ baseURL: '' });

// Submits card + order details to the Go API (POST /api/checkout)
export const placeOrder = async (payload) => {
  // Strip spaces the user typed between card digits so the backend gets a clean 16-digit string
  const formattedPayload = {
    ...payload,
    cardNumber: payload.cardNumber.replace(/\s/g, ''),
  };
  // Go API returns { orderId, status: "PENDING" } immediately after publishing to RabbitMQ
  const response = await api.post('/api/checkout', formattedPayload);
  return response.data;
};

// Polled every 2s from ConfirmationPage until status becomes APPROVED or DECLINED
export const getOrderStatus = async (orderId) => {
  const response = await api.get(`/api/order/${orderId}/status`);
  return response.data;
};

export default api;
