const express = require('express');
const user_route = express();
const session = require('express-session');

user_route.use(express.static('public/user'));
user_route.use(express.static('public'));

user_route.use(
  session({
    secret: "thieghdghhjhajhjshsjjh",
    resave: false,
    saveUninitialized: true,
  })
);

const auth = require("../middleware/auth");

user_route.set("views", "./views/users");

const userController = require('../controller/userController')
const orderController = require('../controller/orderController')
const cartController = require('../controller/cartController')
const wishlistController = require('../controller/wishlistController')



user_route.get('/',userController.loadHome);

user_route.get("/login",auth.isLogout,userController.loadLogin);

user_route.get("/signup",auth.isLogout,userController.loadSignup);
user_route.post("/signup",userController.insertUser,userController.loadOtp);

user_route.get('/verifyotp',userController.loadOtp);
user_route.post("/verifyotp",userController.verifyOtp);

user_route.post("/login", userController.verifyLogin);

user_route.get('/forgetpassword',userController.forgetPassword);
user_route.post('/forgetpassword',userController.verifyNumber);
user_route.post('/forgetpasswordotp',userController.passwordOtpVerify);
user_route.post('/verifypassword',userController.passwordVerify);
user_route.get('/resendotp',userController.resendOtp);

user_route.get('/userprofile',auth.isLogin,userController.userProfile);
user_route.post('/editaddress',auth.isLogin,userController.editAddress);
user_route.get('/deleteaddress',auth.isLogin,userController.deleteAddress);


user_route.get('/shop',userController.shop);
user_route.get('/shop-single',userController.singleProduct);
user_route.post('/shop/update',userController.shopUpdate);

user_route.post('/wishlist/add',wishlistController.addWishlist)
user_route.get('/wishlist',auth.isLogin,wishlistController.showWishlist);
user_route.get('/deletewishlistitem',auth.isLogin,wishlistController.deleteWishlistItem);


user_route.post('/addToCart',auth.isLogin,cartController.addToCart);    
user_route.get('/deleteCartItem',auth.isLogin,cartController.deleteCartItem);
user_route.get('/cart',auth.isLogin,cartController.cart);
user_route.post('/cart/update',cartController.updateCart);

user_route.post('/applycoupon',auth.isLogin,userController.applyCoupon);

user_route.get('/checkout',auth.isLogin,cartController.checkout);
user_route.post('/saveaddress',auth.isLogin,userController.saveAddress);
user_route.post('/placeorder',auth.isLogin,orderController.placeorder);
user_route.post('/create/orderId',auth.isLogin,orderController.createOrder);
user_route.get('/ordersuccess',auth.isLogin,orderController.orderPlaced);
user_route.get('/order',auth.isLogin,orderController.order);
user_route.get('/orderdetails',auth.isLogin,orderController.orderDetails);
user_route.get('/cancelorder',auth.isLogin,orderController.cancelOrder);

user_route.get("/logout",auth.isLogin,userController.userLogout);




module.exports = user_route;
