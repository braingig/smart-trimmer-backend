import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      message: "Smart Trimmer Create Order API",
      method: "POST",
      requiredFields: {
        fullName: "string",
        phoneNumber: "string", 
        address: "string",
        quantity: "number"
      },
      example: {
        fullName: "John Doe",
        phoneNumber: "01712345678",
        address: "123 Main St, Dhaka",
        quantity: 1
      },
      environmentStatus: {
        SHOPIFY_STORE: process.env.SHOPIFY_STORE ? "✓ Set" : "✗ Missing",
        SHOPIFY_ADMIN_TOKEN: process.env.SHOPIFY_ADMIN_TOKEN ? "✓ Set" : "✗ Missing", 
        SHOPIFY_VARIANT_ID: process.env.SHOPIFY_VARIANT_ID ? "✓ Set" : "✗ Missing"
      }
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fullName, phoneNumber, address, quantity } = req.body;

  try {
    const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
    const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
    const VARIANT_ID = process.env.SHOPIFY_VARIANT_ID;

    const response = await axios.post(
      `https://${SHOPIFY_STORE}/admin/api/2024-01/orders.json`,
      {
        order: {
          email: "cod@example.com",
          phone: phoneNumber,
          billing_address: {
            name: fullName,
            address1: address,
            phone: phoneNumber,
            city: "Dhaka",
            country: "Bangladesh",
          },
          line_items: [
            {
              variant_id: Number(VARIANT_ID),
              quantity,
            },
          ],
          financial_status: "pending",
        },
      },
      {
        headers: {
          "X-Shopify-Access-Token": ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, shopifyOrder: response.data.order });
  } catch (err) {
    console.log(err.response?.data);
    res.status(500).json({
      success: false,
      error: err.response?.data || "Unknown error from Shopify",
    });
  }
}
