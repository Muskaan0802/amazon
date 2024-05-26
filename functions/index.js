const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(
    'sk_test_51OkKnJSEwtNa8qiXzdO1bpsA3bQzJATUMs52SnKnyFpjchsP387fUVTO9qC3jkHtwEtlG59jPlrYM4qYkgozXRKo006oQTuMvT'
);

// App config
const app = express();

// Middlewares
app.use(cors({ origin: true }));
app.use(express.json());

// API routes
app.get("/", (request, response) => response.status(200).send("Hello world"));

app.post("/payments/create", async (request, response) => {
  const { total, customerName, customerAddress } = request.body;

  console.log("Payment Request Received for this amount:", total);
  console.log("Customer Name:", customerName);
  console.log("Customer Address:", customerAddress);

  try {
    // Create a payment intent with the provided data
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total * 100, // Convert amount to subunits of the currency
      currency: "inr",
      description: "Payment for products from your website",
      metadata: {
        customer_name: customerName,
        customer_address: customerAddress,
      },
    });

    console.log("Created PaymentIntent:", paymentIntent);

    // Send the client secret back to the client
    response.status(201).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    response.status(500).json({ error: error.message });
  }
});

// Listen command
exports.api = functions.https.onRequest(app);

