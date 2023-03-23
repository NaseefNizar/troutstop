const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const message = require("./otpSms");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Address = require("../models/addressSchema");
const Order = require("../models/orderSchema");
const Coupon = require("../models/couponSchema");
const Banner = require("../models/bannerSchema");
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

const loadHome = async (req, res) => {
  try {
    const banner = await Banner.find({ is_active: 0 });
    if (req.session.user1) {
      check = true;
    } else {
      check = false;
    }
    res.render("home", { user: check, banner: banner });
  } catch (error) {
    console.log(error.message);
  }
};

const loadSignup = async (req, res) => {
  try {
    res.render("signup", { message: null });
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

let newuser;

const insertUser = async (req, res, next) => {
  try {
    email = req.body.email;
    phonenumber = req.body.phonenumber;
    const check = await User.findOne({
      $or: [{ email: email }, { phonenumber: phonenumber }],
    });
    // console.log(check);
    if (check) {
      res.render("signup", { message: "User already exists!!!" });
    } else {
      // const spassword = await securePassword(req.body.password);
      // const user = new User({
      //     firstname: req.body.firstname,
      //     lastname:req.body.lastname,
      //     password: req.body.password,
      //     email:email,
      //     gender:req.body.gender,
      //     zipcode:req.body.zipcode,
      //     phonenumber:phonenumber,
      //     is_admin: 0,
      //     is_verified: 0,
      //     is_blocked: 0
      // });
      newuser = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
        email: email,
        gender: req.body.gender,
        zipcode: req.body.zipcode,
        phonenumber: phonenumber,
      };
      // const userData = await user.save();
      if (newuser) {
        next();
      } else {
        return res.render("signup", {
          message: "Registration failed!!!",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadOtp = async (req, res) => {
  const userData = newuser;
  const mobile = userData.phonenumber;
  // newOtp = 7722
  newOtp = message.sendMessage(mobile, res);
  console.log(newOtp);
  res.render("verifyotp", { newOtp, userData });
};

const verifyOtp = async (req, res) => {
  try {
    const otp = req.body.newOtp;
    console.log(otp);
    console.log(req.body.otp);

    if (otp == req.body.otp) {
      const spassword = await securePassword(req.body.password);
      // console.log(password);
      const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: spassword,
        email: req.body.email,
        gender: req.body.gender,
        zipcode: req.body.zipcode,
        phonenumber: req.body.phonenumber,
      });
      await user.save().then(() => console.log("register successfull"));
      if (user) {
        // req.session.user_id = user._id;
        res.status(201).redirect("/");
      } else {
        res.status(404).render("otp", { message: "invalid OTP" });
      }
    } else {
      console.log("Incorrect OTP");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email, is_admin: 0 });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        req.session.user_id = userData._id;
        req.session.user = userData.name;
        req.session.user1 = true;

        if (userData.is_blocked === 0) {
          res.redirect("/");
        } else {
          res.render("login", { message: "USER BLOCKED!!!" });
        }
      } else {
        res.render("login", { message: "email and password are incorrect" });
      }
    } else {
      res.render("login", { message: "email and password are incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgetPassword = async (req, res) => {
  try {
    res.render("forgetpassword", { message: null });
  } catch (error) {
    console.log(error);
  }
};

let mobile;
const verifyNumber = async (req, res) => {
  try {
    mobile = req.body.phonenumber;
    const check = await User.findOne({ phonenumber: mobile });
    if (check) {
      // newOtp = 7722;
      newOtp = message.sendMessage(mobile, res);
      console.log(newOtp);
      res.render("forgotpasswordotp", { otp: newOtp, mobile: mobile });
    } else {
      res.render("forgetpassword", { message: "Invalid phone number" });
    }
  } catch (error) {}
};

const passwordOtpVerify = async (req, res) => {
  try {
    // mobile = req.body.mobile
    newOtp = message.sendMessage(mobile, res);
    // newOtp = 7722;
    if (req.body.inputotp == req.body.newotp) {
      res.render("password", { mobile: mobile });
    } else
      res.render("forgotpasswordotp", {
        otp: newOtp,
        mobile: mobile,
        message: "Invalid OTP",
      });
  } catch (error) {}
};

const resendOtp = async (req, res) => {
  try {
    // newOtp = 7722;
    // console.log(12);
    newOtp = message.sendMessage(mobile, res);
    res.render("forgotpasswordotp", { otp: newOtp, mobile: mobile });
  } catch (error) {}
};

const passwordVerify = async (req, res) => {
  try {
    const password = await securePassword(req.body.password);
    // console.log(req.body.mobile);
    const newPassword = await User.findOneAndUpdate(
      { phonenumber: req.body.mobile },
      { $set: { password: password } }
    );

    res.render("login", { message: "Login Now" });
  } catch (error) {}
};

const userProfile = async (req, res) => {
  try {
    const id = req.session.user_id;
    const userData = await User.findById({ _id: id });
    const address = await Address.find({
      $and: [{ userId: id }, { is_deleted: 0 }],
    });
    res.render("userprofile", { user: userData, address: address });
  } catch (error) {}
};

const shop = async (req, res) => {
  try {
    if (req.session.user_id) {
      check = true;
    } else {
      check = false;
    }
    const category = await Category.find({ is_available: 1 });
    const product = await Product.find();
    res.render("shop", { product: product, category: category ,user:check});
  } catch (error) {
    console.log(error.message);
  }
};

const shopUpdate = async (req, res) => {
  try {
    const categoryFilter = req.body.categoryfilter;
    const priceFilter = req.body.price;
    let product;
    console.log(categoryFilter);
    console.log(priceFilter);
    if (categoryFilter !== undefined) {
      product = await Product.find({
        category: { $in: categoryFilter },
      }).populate("category");
      if (priceFilter == "high") {
        product = await Product.find({ category: { $in: categoryFilter } })
          .sort({ price: -1 })
          .populate("category");
      } else if (priceFilter == "low") {
        product = await Product.find({ category: { $in: categoryFilter } })
          .sort({ price: 1 })
          .populate("category");
      }
    } else if (categoryFilter == undefined) {
      if (priceFilter == "high") {
        product = await Product.find({})
          .sort({ price: -1 })
          .populate("category");
      } else if (priceFilter == "low") {
        product = await Product.find({})
          .sort({ price: 1 })
          .populate("category");
      }
    } else {
      product = await Product.find({}).populate("category");
    }

    res.json({ product });
  } catch {}
};

const singleProduct = async (req, res) => {
  try {
    if (req.session.user_id) {
      check = true;
    } else {
      check = false;
    }
    const id = req.query.id;
    const product = await Product.findOne({ _id: id });
    res.render("shop-single", { product: product, message: null,user:check });
  } catch (error) {
    console.log(error.message);
  }
};

const addToCart = async (req, res) => {
  try {
    const productId = req.query.id;
    const id = req.session.user_id;
    if (req.session.user_id) {
      check = true;
    } else {
      check = false;
    }
      const userData = await User.findById({ _id: id });
      const productData = await Product.findById({ _id: productId });
      userData.addToCart(productData);
      res.render("shop-single", {
        product: productData,
        user:check,
        message: "Product added to cart",
      });
   
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
      res.render("cart", { cartProducts: completeUser.cart, id: id,user:check });
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

const addWishlist = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userData = await User.findById({ _id: req.session.user_id });
      const productId = req.body.productId;
      const product = await Product.findById({ _id: productId });
      userData.addToWishlist(product);
      res.json({ success: true });
    }
  } catch (error) {}
};

const showWishlist = async (req, res) => {
  try {
    if (req.session.user1) {
      check = true;
    } else {
      check = false;
    }
    const userData = await User.findById({ _id: req.session.user_id }).populate(
      "wishlist.item.productId"
    );
    res.render("wishlist", { items: userData.wishlist.item,user:check });
  } catch (error) {}
};

const deleteWishlistItem = async (req, res) => {
  try {
    const productid = req.query.id;
    const userid = req.session.user_id;
    const userData = await User.findOne({ _id: userid });
    userData.removefromWishlist(productid);
    res.redirect("/wishlist");
  } catch (error) {}
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
  } catch (error) {}
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
  } catch (error) {}
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
    res.render("orders", { order: orders });
  } catch (error) {
    console.log(error);
  }
};

const saveAddress = async (req, res) => {
  try {
    const id = req.session.user_id;
    const address = new Address({
      userId: id,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      housename: req.body.housename,
      locality: req.body.locality,
      landmark: req.body.landmark,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      mobile: req.body.phonenumber,
    });
    await address.save();
    res.redirect("/checkout");
  } catch (error) {
    console.log(error);
  }
};

const editAddress = async (req, res) => {
  try {
    const id = req.session.user_id;
    const address = await Address.findByIdAndUpdate(
      { _id: req.body.addressid },
      {
        $set: {
          userId: id,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          housename: req.body.housename,
          locality: req.body.locality,
          landmark: req.body.landmark,
          city: req.body.city,
          state: req.body.state,
          pincode: req.body.pincode,
          mobile: req.body.phonenumber,
        },
      }
    );
    res.redirect("/userprofile#");
  } catch (error) {
    console.log(error);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const address = await Address.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          is_deleted: 1,
        },
      }
    );
    res.redirect("/userprofile#");
  } catch (error) {}
};

const applyCoupon = async (req, res) => {
  let totalPrice;
  let discount;
  let message;
  try {
    const couponname = req.body.coupon;
    console.log(couponname);
    const userId = req.session.user_id;
    const userData = await User.findById({ _id: userId });
    const currentDate = new Date();
    const coupon = await Coupon.findOne({
      $and: [{ name: couponname }, { expiry_date: { $gte: currentDate } }],
    });
    // console.log(coupon);
    totalPrice = userData.cart.totalPrice;

    if (coupon) {
      if (userData.cart.totalPrice > coupon.min_value) {
        discount = (totalPrice * coupon.discount) / 100;
        if (discount > coupon.max_discount) {
          totalPrice -= coupon.max_discount;
          discount = coupon.max_discount;
          // console.log(totalPrice);
          message = "Coupon applied successfully";
        } else {
          totalprice -= discount;
          // console.log(totalPrice);
        }
        req.session.couponTotal = totalPrice;
        // console.log(req.session.couponTotal);
      } else {
        message = "Coupon not applicable!!!";
        discount = 0;
      }
    } else {
      message = "Coupon expired!!!";
      discount = 0;
    }

    res.json({ totalPrice, discount, message });
  } catch (error) {}
};

const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    return res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadHome,
  loadLogin,
  loadSignup,
  insertUser,
  loadOtp,
  verifyOtp,
  verifyLogin,
  userProfile,
  forgetPassword,
  verifyNumber,
  passwordOtpVerify,
  passwordVerify,
  resendOtp,
  shop,
  shopUpdate,
  singleProduct,
  addWishlist,
  showWishlist,
  deleteWishlistItem,
  addToCart,
  cart,
  deleteCartItem,
  updateCart,
  checkout,
  saveAddress,
  editAddress,
  deleteAddress,
  placeorder,
  orderPlaced,
  createOrder,
  order,
  orderDetails,
  applyCoupon,
  cancelOrder,
  userLogout,
};
