export default function handler(req, res) {
  res.status(200).json({ 
    message: "Smart Trimmer Backend API",
    endpoints: {
      createOrder: "/api/create-order.js (POST)"
    }
  });
}