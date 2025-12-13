import axios from "axios";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method === "GET") {
        return res.status(200).json({ message: "API working" });
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { fullName, phoneNumber, address, quantity } = req.body;

    try {
        const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
        const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
        const VARIANT_ID = process.env.SHOPIFY_VARIANT_ID;

        const emailBase = fullName.toLowerCase().replace(/\s+/g, "");
        const uniqueEmail = `${emailBase}${Math.floor(Math.random() * 9000) + 1000}@gmail.com`;

        const city = (address?.split(",").pop() || "Dhaka").trim();

        const response = await axios.post(
            `https://${SHOPIFY_STORE}/admin/api/2024-01/orders.json`,
            {
                order: {
                    customer: {
                        first_name: fullName.split(" ")[0],
                        last_name: fullName.split(" ").slice(1).join(" ") || "-",
                        email: uniqueEmail,
                        phone: phoneNumber,
                    },
                    line_items: [
                        {
                            variant_id: Number(VARIANT_ID),
                            quantity,
                        },
                    ],
                    billing_address: {
                        name: fullName,
                        address1: address,
                        phone: phoneNumber,
                        city,
                        country: "Bangladesh",
                    },
                    shipping_address: {
                        name: fullName,
                        address1: address,
                        phone: phoneNumber,
                        city,
                        country: "Bangladesh",
                    },
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

        res.json({ success: true, order: response.data.order });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.response?.data || err.message,
        });
    }
}
