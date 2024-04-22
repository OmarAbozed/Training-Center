const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    cart_items: {
      type: [mongoose.Schema.ObjectId],
      ref: "Course",
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
    paid:{
      type: Boolean,
      default: false,
      required: true
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
exports.Order = Order;
