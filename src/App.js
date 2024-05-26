import React from "react";
import "./App.css";
import { useEffect } from "react";
import { useStateValue } from "./StateProvider";
import { auth } from "./firebase";
import Header from "./Header";
import Home from "./Home";
import Checkout from "./Checkout";
import Orders from "./Orders";
import Order from "./Order";
import Payment from "./Payment";
import Login from "./Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const promise = loadStripe("pk_test_51OkKnJSEwtNa8qiXcZtcKw6VAJ1W7AsQkSvn4x6dbYm8YtIwMGrX3uAnZm0QjMlpCf68gEmADoKpbe5lIpwJGriL00W9Hq9vFU");
function App() {
  const [{ basket }, dispatch] = useStateValue();


  useEffect(() => {
    // will only run once when the app component loads...

    auth.onAuthStateChanged((authUser) => {
      console.log("THE USER IS >>> ", authUser);

      if (authUser) {
        // the user just logged in / the user was logged in

        dispatch({
          type: "SET_USER",
          user: authUser,
        });
      } else {
        // the user is logged out
        dispatch({
          type: "SET_USER",
          user: null,
        });
      }
    });
  }, []);

  return (
    // BEM
    <Router>
      <div className="app">
        <Routes>
          <Route path="/checkout" element={[<Header />, <Checkout />]}/>
          <Route path="/orders" element={[<Orders />]}/>

          <Route path="/Login" element={[<Login />]}/>
          <Route path="/payment" element={[<Header />,<Elements stripe={promise}> <Payment /></Elements>]}/>
          <Route path="/" element={[<Header />, <Home />]}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;