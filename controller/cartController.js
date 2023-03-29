const User = require("../models/userModel");
const Product = require("../models/productSchema");
const Address = require("../models/addressSchema");
const Coupon = require("../models/couponSchema");



const addToCart = async (req, res) => {
    try {
      const productId = req.body.productId;
      console.log(productId);
      const id = req.session.user_id;
      if (req.session.user_id) {
        const userData = await User.findById({ _id: id });
        const productData = await Product.findById({ _id: productId });
        userData.addToCart(productData);
        res.json({ status: true })
        check = true;
      } else {
        check = false;
        res.json({ status: false })
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const cart = async (req, res) => {
    try {
      const id = req.session.user_id;
      if (req.session.user_id) {
        check = true;
      } else {
        check = false;
      }
      const userData = await User.findById({ _id: id });
      const completeUser = await userData.populate("cart.item.productId");
      res.render("cart", { cartProducts: completeUser.cart, id: id, user: check });
    } catch (error) {
      console.log(error);
    }
  };
  
  const deleteCartItem = async (req, res) => {
    try {
      const productid = req.query.id;
      const userid = req.session.user_id;
      const userData = await User.findOne({ _id: userid });
      userData.removefromCart(productid);
      res.redirect("/cart");
    } catch (error) {
      console.log(error);
    }
  };


  const updateCart = async (req, res) => {
    try {
      let { newQuantity, itemId } = req.body;
      const product = await Product.findOne({ _id: itemId });
      const userData = await User.findById({ _id: req.session.user_id });
      const total = await userData.updateCart(itemId, newQuantity);
      const price = product.price;
      res.json({ total, price });
    } catch (error) {
      console.log(error);
    }
  };
  
  const checkout = async (req, res) => {
    try {
      const id = req.session.user_id;
      const currentDate = new Date();
      const userData = await User.findById({ _id: id });
      const address = await Address.find({
        $and: [{ userId: id }, { is_deleted: 0 }],
      });
      const coupon = await Coupon.find({ expiry_date: { $gte: currentDate } });
      const completeUser = await userData.populate("cart.item.productId");
      res.render("checkout", {
        cartProducts: completeUser.cart,
        id: id,
        address: address,
        coupon: coupon,
        user: userData,
        keyid: process.env.key_id,
        keysecret: process.env.key_secret,
      });
    } catch (error) {
      console.log(error);
    }
  };

  module.exports = {
    addToCart,
    cart,
    deleteCartItem,
    updateCart,
    checkout,
  }