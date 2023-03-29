const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const message = require("./otpSms");
const Product = require("../models/productSchema");
const Category = require("../models/categorySchema");
const Address = require("../models/addressSchema");
const Coupon = require("../models/couponSchema");
const Banner = require("../models/bannerSchema");

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
    if (check) {
      res.render("signup", { message: "User already exists!!!" });
    } else {
      newuser = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
        email: email,
        gender: req.body.gender,
        zipcode: req.body.zipcode,
        phonenumber: phonenumber,
      };
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
  newOtp = message.sendMessage(mobile, res);
  console.log(newOtp);
  res.render("verifyotp", { newOtp, userData });
};

const verifyOtp = async (req, res) => {
  try {
    const otp = req.body.newOtp;
    if (otp == req.body.otp) {
      const spassword = await securePassword(req.body.password);
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
        res.render("login", { message: "Email or password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email or password is incorrect" });
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
    newOtp = message.sendMessage(mobile, res);
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
    res.render("shop", { product: product, category: category, user: check });
  } catch (error) {
    console.log(error.message);
  }
};

const search = async (req, res) => {
  try {
    if (req.session.user_id) {
      check = true;
    } else {
      check = false;
    }
    const search = req.body.search
    console.log(search);
    const category = await Category.find({ is_available: 1 });
    // const product = await Product.find({ $or: [{ 'name': { $regex: '' + search + ".*" } }, { 'category': { $regex: ".*" + search + ".*" } }] });
    //  const product = await Product.find({$or:[
    //    {'name': new RegExp('^' + search + '.*') },{ 'category': new RegExp('^' + search + '.*')  }]}).populate({
    //     path: 'category',
    //     match: { 'name': new RegExp('^' + search + '.*') }
    //   });
    const product = await Product.find(

    {'name': new RegExp('^' + search + '.*') },

  
)


       console.log(product);
    res.render("shop", { product: product, category: category, user: check });
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
      } else {
        product = await Product.find({}).populate("category");
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
    res.render("shop-single", { product: product, message: null, user: check });
  } catch (error) {
    console.log(error.message);
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

const editDetail = async (req, res) => {
  try {
    // const id = req.session.user_id;
    const userData = await User.findByIdAndUpdate(
      { _id: req.session.user_id},
      {
        $set: {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          gender: req.body.gender,
          phonenumber: req.body.mobilenumber,
        },
      }
    );
    res.redirect("/userprofile");
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
  search,
  saveAddress,
  editAddress,
  deleteAddress,
  editDetail,
  applyCoupon,
  userLogout,
};
