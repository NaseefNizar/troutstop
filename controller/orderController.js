const User = require("../models/userModel");
const Product = require("../models/productSchema");
const Address = require("../models/addressSchema");
const Order = require("../models/orderSchema");
const Razorpay = require("razorpay");

var instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
});

let orders;
const placeorder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        if (userId) {
            const userData = await User.findById({ _id: userId });
            const completeUser = await userData.populate("cart.item.productId");
            const productData = await Product.find({});
            const id = req.body.selected;
            console.log(id);
            const payment = req.body.payment;
            console.log(payment);
            const address = await Address.findById({ _id: id });
            if (req.session.couponTotal) {
                completeUser.cart.totalPrice = req.session.couponTotal;
            }
            const completeaddress = await address.populate("userId");
            orders = new Order({
                userId: userId,
                addressId: address._id,
                products: completeUser.cart,
                payment: payment,
            });
            if (completeUser.cart.totalPrice > 0 && payment == "COD") {
                res.redirect("/ordersuccess");
            } else if (completeUser.cart.totalPrice > 0 && payment == "UPI") {
                console.log(11111);
                // res.redirect('/ordersuccess')
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const createOrder = async (req, res) => {
    try {
        var options = {
            amount: req.body.amount, // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_rcptid_11",
        };
        instance.orders.create(options, function (err, order) {
            console.log(order);
            res.send({ orderId: order.id });
        });
    } catch (error) { }
};

const orderPlaced = async (req, res) => {
    try {
        console.log(orders);
        const userId = req.session.user_id;
        const userData = await User.findById({ _id: userId });
        const productData = await Product.find({});

        // Update the order with the Razorpay payment details, if available
        if (req.body.razorpayPaymentId) {
            orders.razorpayPaymentId = req.body.razorpayPaymentId;
            orders.razorpayOrderId = req.body.razorpayOrderId;
            orders.razorpaySignature = req.body.razorpaySignature;
        }

        // Save the order to the database
        await orders.save();

        // Clear the cart for the user
        await User.updateOne(
            { _id: userId },
            { $set: { "cart.item": [], "cart.totalPrice": "0" } }
        );

        // Update the product stock in the database
        for (let key of userData.cart.item) {
            for (let prod of productData) {
                if (
                    new String(prod._id).trim() == new String(key.productId._id).trim()
                ) {
                    prod.inStock = prod.inStock - key.qty;
                    await prod.save();
                }
            }
        }

        // Render the order confirmation page
        res.render("ordersuccess");
    } catch (error) {
        // Handle error
        console.log(error);
        res.status(500).send("An error occurred while placing the order");
    }
};

const order = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const orderData = await Order.find({ userId: userId })
            .sort({ $natural: -1 })
            .populate("products.item.productId");
        res.render("orders", { order: orderData });
    } catch (error) {
        console.log(error);
    }
};

const orderDetails = async (req, res) => {
    try {
        const orderid = req.query.id;
        const orderData = await Order.findById({ _id: orderid });
        const completeOrderData = await (
            await orderData.populate("products.item.productId")
        ).populate("addressId");
        res.render("orderdetails", { orderData: completeOrderData });
    } catch (error) { }
};

const cancelOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const orderId = req.query.id;
        const orderData = await Order.findByIdAndUpdate(
            { _id: orderId },
            { $set: { status: "CANCELLED" } }
        );
        const orders = await Order.find({ userId: userId });
        const productData = await Product.find({});
        for (let key of orderData.products.item) {
            for (let prod of productData) {
                if (
                    new String(prod._id).trim() == new String(key.productId._id).trim()
                ) {
                    prod.inStock = prod.inStock + key.qty;
                    await prod.save();
                }
            }
        }
        res.redirect("/order");
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    placeorder,
    orderPlaced,
    createOrder,
    order,
    orderDetails,
    cancelOrder,
};
