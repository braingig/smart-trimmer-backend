import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fullName, phoneNumber, address, quantity } = req.body;

  const formattedPhone = phoneNumber.startsWith("+")
    ? phoneNumber
    : `+88${phoneNumber}`;

  try {
    const response = await axios.post(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/orders.json`,
      {
        order: {
          email: "cod@example.com",
          phone: formattedPhone,
          billing_address: {
            name: fullName,
            address1: address,
            phone: formattedPhone,
            city: "Dhaka",
            country: "Bangladesh",
          },
          line_items: [
            {
              variant_id: Number(process.env.SHOPIFY_VARIANT_ID),
              quantity,
            },
          ],
          financial_status: "pending",
        },
      },
      {
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({ success: true, order: response.data.order });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.response?.data || "Shopify API Error",
    });
  }
}
