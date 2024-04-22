const { Course } = require("../models/Course");
const { Order } = require("../models/Order");
const { User } = require("../models/User");

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
    if (user.courses.includes(req.params.id)) {
      return res.status(400).json("Already In Courses");
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

async function checkoutCartController(req, res, next) {
  try {
    let data = {
      api_key: process.env.PAYMOB_API_KEY,
    };
    let cart = await User.findById(req.userId).populate("cart").select("cart");
    let user = await User.findById(req.userId);
    req.user = user;
    let totalPrice = 0;
    cart.cart.forEach((course) => {
      totalPrice += course.price;
    });
    let order = {
      cart: cart,
      totalPrice: totalPrice,
    };
    req.order = order;
    let request = await fetch("https://accept.paymob.com/api/auth/tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    let response = await request.json();
    req.token = response.token;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function handlePayment(req, res, next) {
  try {
    let data = {
      auth_token: req.token,
      delivery_needed: "false",
      amount_cents: req.order.totalPrice * 100,
      currency: "EGP",
      items: [
        {
          name: "ASC1515",
          amount_cents: "500000",
          description: "Smart Watch",
          quantity: "1",
        },
        {
          name: "ERT6565",
          amount_cents: "200000",
          description: "Power Bank",
          quantity: "1",
        },
      ],
    };
    let request = await fetch(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    let response = await request.json();
    req.id = response.id;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function paymentUserEndPoint(req, res) {
  try {
    let arr = [];
    const cart = req.order.cart.cart;
    for (const item of cart) {
      const courseId = item._id;
      arr.push(courseId);
    }

    let data = {
      auth_token: req.token,
      amount_cents: req.order.totalPrice * 100,
      expiration: 3600,
      order_id: req.id,
      billing_data: {
        apartment: "NA",
        email: req.user.email,
        floor: "NA",
        first_name: req.user.name.split(" ")[0],
        street: "NA",
        building: "NA",
        phone_number: "+201234567899",
        shipping_method: "NA",
        postal_code: "NA",
        city: "Shorouk",
        country: "EG",
        last_name: req.user.name.split(" ")[1]
          ? req.user.name.split(" ")[1]
          : "NA",
        state: "CAI",
      },
      currency: "EGP",
      integration_id: 4272185,
      lock_order_when_paid: "true",
    };
    let request = await fetch(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    await Order.deleteMany({ user_id: req.userId });
    const transaction = new Order({
      order_id: req.id,
      total_price: req.order.totalPrice,
      user_id: req.userId,
      paid: false,
      cart_items: arr,
    });
    await transaction.save();
    let response = await request.json();
    let url = `https://accept.paymob.com/api/acceptance/iframes/793481?payment_token=${response.token}`;
    return res.status(200).json(url);
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function paymentSuccess(req, res) {
  try {
    // Test Mode Payment API Always returns with unsuccessful payment attempts
    // if (!req.query.success) {
    //   return res.status(400).json("Something Went Wrong");
    // }
    let transaction = await Order.findOne({ order_id: req.query.order });
    if (!transaction) {
      return res.status(400).json("Something Went Wrong");
    }
    let user = await User.findById(transaction.user_id);
    if (!user) {
      return res.status(400).json("Something Went Wrong");
    }
    for (const item of transaction.cart_items) {
      let course = await Course.findById(item);
      course.sellings += 1;
      course.students.push(user._id);
      await course.save();
      user.courses.push(item);
    }
    await Order.findByIdAndDelete(transaction._id);
    user.cart.splice(0, user.cart.length);
    await user.save();
    return res.redirect("https://skillify-center.netlify.app/confirmation");
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = {
  addToCartController,
  getCartController,
  removeItemFromCartController,
  checkoutCartController,
  handlePayment,
  paymentUserEndPoint,
  paymentSuccess,
};
