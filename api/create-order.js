import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

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
        console.log("Shopify Store:", SHOPIFY_STORE);
        const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
        const VARIANT_ID = process.env.SHOPIFY_VARIANT_ID;

        const baseName = fullName.toLowerCase().replace(/\s+/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const uniqueEmail = `${baseName}${randomNum}@gmail.com`;

        let city = "Dhaka";
        if (address && typeof address === "string") {
            const parts = address.split(",").map(p => p.trim()).filter(Boolean);
            if (parts.length > 0) {
                // assume last part is city/district
                city = parts[parts.length - 1] || "Dhaka";
            }
        }
        const data = {
            order: {
                customer: {
                    first_name: fullName.split(" ")[0],
                    last_name: fullName.split(" ").slice(1).join(" ") || "-",
                    email: uniqueEmail,
                    phone: phoneNumber
                },

                email: uniqueEmail,
                phone: phoneNumber,

                billing_address: {
                    name: fullName,
                    address1: address || "",
                    phone: phoneNumber,
                    city: city,
                    country: "Bangladesh",
                },

                shipping_address: {
                    name: fullName,
                    address1: address || "",
                    phone: phoneNumber,
                    city: city,
                    country: "Bangladesh",
                },
                line_items: [
                    {
                        variant_id: Number(VARIANT_ID),
                        quantity,
                    }
                ],

                financial_status: "pending",
            },

        }
        console.log(data)
        const response = await axios.post(
            `https://${SHOPIFY_STORE}/admin/api/2024-01/orders.json`,
            data,
            {
                headers: {
                    "X-Shopify-Access-Token": ACCESS_TOKEN,
                    "Content-Type": "application/json",
                },
            }
        );

        res.json({ success: true, shopifyOrder: response.data.order });
    } catch (err) {
        console.error("Full error:", err);
        console.error("Error response:", err.response?.data);
        console.error("Error status:", err.response?.status);

        res.status(500).json({
            success: false,
            error: err.response?.data?.errors || err.response?.data || err.message || "Unknown error from Shopify",
            status: err.response?.status,
            details: err.response?.data
        });
    }
}
