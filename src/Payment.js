import React, { useState, useEffect } from 'react';
import './Payment.css';
import { useStateValue } from "./StateProvider";
import CheckoutProduct from "./CheckoutProduct";
import { Link, useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import CurrencyFormat from "react-currency-format";
import { getBasketTotal } from "./reducer";
import axios from './Axios';
import { db } from "./firebase";

function Payment() {
    const [{ basket, user }, dispatch] = useStateValue();
    const navigate = useNavigate();

    const stripe = useStripe();
    const elements = useElements();

    const [succeeded, setSucceeded] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [disabled, setDisabled] = useState(true);
    const [clientSecret, setClientSecret] = useState("");

    // New states for customer information
    const [customerName, setCustomerName] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");

    useEffect(() => {
        const getClientSecret = async () => {
            const response = await axios({
                method: 'post',
                url: `/payments/create?total=${getBasketTotal(basket) * 100}`
            });
            console.log('Client Secret:', response.data.clientSecret);
            setClientSecret(response.data.clientSecret);
        }
    
        getClientSecret();
    }, [basket]);
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
    
        try {
            const payload = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: customerName, // Provide the customer's name
                        address: {
                            line1: customerAddress, // Provide the customer's address
                        },
                    },
                },
            });
    
            if (payload.error) {
                setError(`Payment failed: ${payload.error.message}`);
                setProcessing(false);
            } else {
                setSucceeded(true);
                setError(null);
                setProcessing(false);
    
                // Handle successful payment
                db
                  .collection('users')
                  .doc(user?.uid)
                  .collection('orders')
                  .doc(payload.paymentIntent.id)
                  .set({
                      basket: basket,
                      amount: payload.paymentIntent.amount,
                      created: payload.paymentIntent.created
                  });
    
                dispatch({
                    type: 'EMPTY_BASKET'
                });
    
                navigate('/orders', { replace: true });
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            setError("Payment failed. Please try again later.");
            setProcessing(false);
        }
    };
    

    const handleChange = (event) => {
        setDisabled(event.empty);
        setError(event.error ? event.error.message : "");
    };

    return (
        <div className='payment'>
            <div className='payment__container'>
                <h1>
                    Checkout (
                    <Link to="/checkout">{basket?.length} items</Link>
                    )
                </h1>

                <div className='payment__section'>
                    <div className='payment__title'>
                        <h3>Delivery Address</h3>
                    </div>
                    <div className='payment__address'>
                        <p>{user?.email}</p>
                        {/* Display user's address if available */}
                        {user?.address && (
                            <p>{user.address}</p>
                        )}
                    </div>
                </div>

                <div className='payment__section'>
                    <div className='payment__title'>
                        <h3>Review items and delivery</h3>
                    </div>
                    <div className='payment__items'>
                        {basket.map(item => (
                            <CheckoutProduct
                                key={item.id}
                                id={item.id}
                                title={item.title}
                                image={item.image}
                                price={item.price}
                                rating={item.rating}
                            />
                        ))}
                    </div>
                </div>

                <div className='payment__section'>
                    <div className="payment__title">
                        <h3>Payment Method</h3>
                    </div>
                    <div className="payment__details">
                        <form onSubmit={handleSubmit}>
                            <CardElement onChange={handleChange} />
                            <div className='payment__priceContainer'>
                                <CurrencyFormat
                                    renderText={(value) => (
                                        <h3>Order Total: {value}</h3>
                                    )}
                                    decimalScale={2}
                                    value={getBasketTotal(basket)}
                                    displayType={"text"}
                                    thousandSeparator={true}
                                    prefix={"$"}
                                />
                                <button disabled={processing || disabled || succeeded}>
                                    <span>{processing ? 'Processing' : 'Buy Now'}</span>
                                </button>
                            </div>
                            {error && <div>{error}</div>}
                            {/* <div className='payment__customerInfo'>
                                <input
                                    type="text"
                                    placeholder="Customer Name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Customer Address"
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    required
                                />
                            </div> */}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Payment;
