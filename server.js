import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ENV variables
const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const VARIANT_ID = process.env.SHOPIFY_VARIANT_ID;

// Create Order API
app.post("/create-order", async (req, res) => {
  const { fullName, phoneNumber, address, quantity } = req.body;

  try {
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
          financial_status: "pending", // cash on delivery
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
    console.log(err.response.data);
    res.status(500).json({
      success: false,
      error: err.response?.data || "Unknown error from Shopify",
    });
  }
});

app.listen(5000, () => {
  console.log("Shopify Backend Running on port 5000");
});
