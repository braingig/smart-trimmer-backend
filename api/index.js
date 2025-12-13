// export default function handler(req, res) {
//   res.status(200).json({ 
//     message: "Smart Trimmer Backend API",
//     endpoints: {
//       createOrder: "/api/create-order.js (POST)"
//     }
//   });
// }


import express from "express";
import createOrderRoute from "./create-order.js";

const app = express();
app.use(express.json());

app.use("/create-order", createOrderRoute);

app.listen(5000, () => console.log("Server running on port 5000"));
