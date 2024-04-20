const { Course } = require("../models/Course");
const { User } = require("../models/User");
const stripe = require("stripe")(process.env.STRIP_SECRET_KEY);

async function addToCartController(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json("Course Not Found");
    }
    let user = await User.findById(req.userId);
    if (user.cart.includes(req.params.id)) {
      return res.status(400).json("Already In Cart");
    }
    user.cart.push(req.params.id);
    await user.save();
    let cart = await User.findById(req.userId).populate("cart").select("cart");
    let totalPrice = 0;
    cart.cart.forEach((course) => {
      totalPrice += course.price;
    });
    let response = {
      cart: cart.cart,
      totalPrice: totalPrice,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getCartController(req, res) {
  try {
    let cart = await User.findById(req.userId).populate("cart").select("cart");
    let totalPrice = 0;
    cart.cart.forEach((course) => {
      totalPrice += course.price;
    });
    let response = {
      cart: cart.cart,
      totalPrice: totalPrice,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function removeItemFromCartController(req, res) {
  try {
    const user = await User.findById(req.userId);
    const course = user.cart.indexOf(req.params.id);
    if (course !== -1) {
      user.cart.splice(course, 1);
      await user.save();
    }
    let cart = await User.findById(req.userId).populate("cart").select("cart");
    let totalPrice = 0;
    cart.cart.forEach((course) => {
      totalPrice += course.price;
    });
    let response = {
      cart: cart.cart,
      totalPrice: totalPrice,
    };
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function checkoutCartController(req, res) {
  try {
    let cart = await User.findById(req.params.id)
      .populate("cart")
      .select("cart");
    let user = await User.findById(req.params.id);
    // let cart = await User.findById(req.userId).populate("cart").select("cart");
    // let user = await User.findById(req.userId);
    let totalPrice = 0;
    cart.cart.forEach((course) => {
      totalPrice += course.price;
    });
    return res.render("home", {
      key: process.env.STRIP_PUBLISHABLE_KEY,
      totalPrice: totalPrice * 100,
      username: user.name,
    });
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function paymentHandler(req, res) {
  try {
    stripe.customers
      .create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: req.body.username,
        address: {
          line1: "32 Shorouk Academy",
          postal_code: "110092",
          city: "Shorouk",
          state: "Cairo",
          country: "Egypt",
        },
      })
      .then((customer) => {
        return stripe.charges.create({
          amount: req.body.totalPrice,
          description: "Skillify",
          currency: "USD",
          customer: customer.id,
        });
      })
      .then((charge) => {
        console.log(charge);
        return res
          .status(200)
          .json({ state: "Success", invoice: charge.receipt_url });
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).send("Transaction Failed");
      });
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = {
  addToCartController,
  getCartController,
  removeItemFromCartController,
  checkoutCartController,
  paymentHandler,
};
