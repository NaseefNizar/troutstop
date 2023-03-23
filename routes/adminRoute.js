const express = require('express');
const admin_route = express();
const session = require('express-session');
const nocache = require("nocache");
const multer = require('../middleware/multer');



// admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

admin_route.use(express.static('public/admin'));
admin_route.use(express.static('public'));


admin_route.use(
    session({
      secret: "hdfheruuyfhrhfhjfhkj",
      resave: false,
      saveUninitialized: true,
    })
  );

// admin_route.use(express.json());
// admin_route.use(express.urlencoded({ extended: true }));



const adminController = require("../controller/adminController");
const adminAuth = require("../middleware/adminAuth")


admin_route.get("/",adminAuth.isLogout,adminController.adminLogin);
admin_route.post("/",adminController.verifyLogin);
admin_route.get("/home",adminAuth.isLogin,adminController.loadHome);

admin_route.get("/banner",adminAuth.isLogin,adminController.banner);
admin_route.post("/addbanner",multer.upload.array('bannerImage',1),adminController.addBanner);
admin_route.get("/bannerstatus",adminAuth.isLogin,adminController.bannerStatus);

admin_route.get("/customers",adminAuth.isLogin,adminController.loadCustomers);
admin_route.get("/blockuser",adminAuth.isLogin,adminController.blockUser);

admin_route.get('/category',adminAuth.isLogin,adminController.loadCategory);
admin_route.get('/addcategory',adminAuth.isLogin,adminController.addCategory);
admin_route.post('/addcategory',adminAuth.isLogin,adminController.categoryAdd);
admin_route.get('/blockcategory',adminAuth.isLogin,adminController.blockCategory);
admin_route.get('/editcategory',adminAuth.isLogin,adminController.loadeditCategory);
admin_route.post('/editcategory',adminAuth.isLogin,adminController.editCategory);

admin_route.get('/product',adminAuth.isLogin,adminController.loadProduct);
admin_route.get('/addproduct',adminAuth.isLogin,adminController.addProduct);
admin_route.post('/addproduct',multer.upload.array('images',5),adminController.productAdd);
admin_route.get("/editproduct",adminController.loadeditProduct);
admin_route.post('/editproduct',multer.upload.array('images',5),adminController.editProduct);
admin_route.get('/deleteproduct',adminController.deleteProduct);

admin_route.get('/coupon',adminAuth.isLogin,adminController.loadCoupon);
admin_route.post('/savecoupon',adminAuth.isLogin,adminController.saveCoupon);
admin_route.get('/deletecoupon',adminAuth.isLogin,adminController.deleteCoupon);
admin_route.post('/editcoupon',adminAuth.isLogin,adminController.editCoupon);




admin_route.get('/orders',adminAuth.isLogin,adminController.orders);
admin_route.get('/cancelorder',adminAuth.isLogin,adminController.cancelOrder);
admin_route.get('/orderdetails',adminAuth.isLogin,adminController.orderDetails);
admin_route.post('/orderstatus',adminAuth.isLogin,adminController.orderStatus);






admin_route.get('/logout',adminAuth.isLogout,adminController.logOut)

module.exports = admin_route 