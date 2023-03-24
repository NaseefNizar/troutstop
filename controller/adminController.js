const User = require("../models/userModel");
const Category = require('../models/categorySchema');
const Product = require('../models/productSchema');
const Order = require('../models/orderSchema');
const Banner = require('../models/bannerSchema');
const Coupon = require('../models/couponSchema');
const bcrypt = require("bcrypt");
const Swal = require('sweetalert2');

const adminLogin = async (req, res) => {
  try { 
      res.render("login");
    }
  catch (error) {
    console.log(error);
  }
};

const verifyLogin = async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const userData = await User.findOne({ email: email });
      if (userData) {
        const passwordMatch = await bcrypt.compare(password, userData.password);
  
        if (passwordMatch) {
          if (userData.is_admin === 0) {
            res.render("login", { message: "Email or Password is incorrect" });
          } else {
          req.session.admin_id = userData._id;
          res.redirect("/admin/home");
          }
        } else {
          res.render("login", { message: "Email or Password is incorrect" });
        }
      } else {
        res.render("login", { message: "Email or Password is incorrect" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const loadHome = async (req, res) => {
    try {
      if (req.session.admin_id) {
    const products=await Product.find({})
    // console.log(products);
    let product=[],qty=[]
    products.map(x=>{
      product=[...product,x.name]
      // console.log(product);
      qty=[...qty,x.inStock]
    })
    const arr = [];
    const order = await Order.find().populate('products.item.productId');    
    for (let orders of order) {
      for (let product of orders.products.item) {
        const index = arr.findIndex(obj => obj.product == product.productId.name);
        if (index !== -1) {
          arr[index].qty += product.qty;
        } else {
          arr.push({ product: product.productId.name, qty: product.qty });
        }
      }
    }
    const key1 = [];
    const key2 = [];
    arr.forEach(obj => {
      key1.push(obj.product);
      key2.push(obj.qty);
    });
    console.log(key1);
    console.log(key2);
    const sales = key2.reduce((value,number)=>{
     return value+number
      },0)
console.log(sales);

        res.render("home",{key1,key2,product,qty,sales});
      } 
      else {
        res.render("login");
      }
    }
     catch (error) {
      console.log(error);
    }
  };

  const loadCustomers = async (req, res) => {
    try { 
    // const userData = await User.findById({ _id: req.session.admin_id });
    const userData = await User.find({ is_admin: 0 });
    res.render("customers", { users: userData });

        // res.render('customers'),{admin:userData};
       
    } catch (error) {
      console.log(error);
    }
  };

  const logOut = async(req, res) => {
    try{
      req.session.destroy();
      // res.redirect('/admin');
    }catch (error) {
      console.log(error);
    }
  };

  const blockUser = async(req,res) => {
    try{
        const user_id = req.query.id;
        const userData = await User.findById({_id:user_id})
        if(userData.is_blocked){
          await User.findByIdAndUpdate({_id:user_id},{$set:{is_blocked: 0}});
        }
        else{
          await User.findByIdAndUpdate({_id:user_id},{$set:{is_blocked: 1}});
        }
        res.redirect('/admin/customers');
    }catch(error){
      console.log(error
        );
    }
}
 const loadCategory = async(req,res) => {
  try{
    const data = await Category.find()
    // console.log(data);
    res.render('category',{category:data})
  }
  catch(error){
    console.log(error);
  }
 }   
 
 const addCategory = async(req,res) => {
  try{
    res.render('addcategory')
  }
  catch(error){
    console.log(error);
  }
 }  

 const categoryAdd = async(req,res) => {
  let categoryData
  try{
    const category = await Category.findOne({name:req.body.categoryname})
    if(category){
      res.render('addcategory',{message:'Category already exist!!!'})
    }else{
      const category = new Category({
          name: req.body.categoryname, 
      });   
       categoryData = await category.save();
    }
      if (categoryData) {
        res.render('addcategory', { message: "category added successfully" })
    }
    else {
        res.render('addcategory', {message:"failed"})
    }
  }catch(error){
    console.log(error);
  } 
};

const blockCategory = async(req,res) => {
  try{
    const category_id = req.query.id;
    const categoryData = await Category.findById({_id:category_id})
    if(categoryData.is_available){
      await Category.findByIdAndUpdate({_id:category_id},{$set:{is_available: 0}});
    }
    else{
      await Category.findByIdAndUpdate({_id:category_id},{$set:{is_available: 1}});
    }
    res.redirect('/admin/category');
}catch(error){
  console.log(error
    );
}

}

const loadeditCategory = async(req,res) => {
  try{
    const id = req.query.id
   const data = await  Category.findOne({_id: id})

    res.render('editcategory',{category:data})
  }
  catch(error){
    console.log(error);
  }
 }  

const editCategory = async (req,res) => {
  try {
    const id = req.query.id
    const category = await  Category.findOne({_id: id})
    // console.log(category);
    if(category){
      // console.log(req.body.categoryname);
      const name=req.body.categoryname
    const categoryData = await  Category.findByIdAndUpdate({_id: id},{$set: {name:name}})
    // console.log(categoryData);
    res.redirect('/admin/category')
    }
  } catch (error) {
    console.log(error);
  }
  }

const loadProduct = async(req,res) => {
  try{
    const product = await Product.find({}).populate('category');
    // console.log(product);
    res.render('product',{product:product})
  }
  catch(error){
    console.log(error);
  }
 };  

 const loadeditProduct = async(req,res) => {
  try{
    const id = req.query.id
    const data = await  Product.findOne({_id:id})
    const category = await Category.find({})
    res.render('editproduct',{product:data,category:category})
  }
  catch(error){
    console.log(error);
  }
 }  

 const editProduct = async(req,res) => {
  try {
    const id = req.query.id
    console.log(id);
    const productData = await Product.findByIdAndUpdate(
      { _id:id },
      {
        $set: {
          name: req.body.name, 
          description:req.body.description,
          brand:req.body.brand,
          price:req.body.price,
          category:req.body.category,
          inStock:req.body.stock,
          images:req.files.map((x) => x.filename),
        },
      }
    );
    console.log(productData);
    if(productData){
    res.redirect('/admin/product')
     } else{
      res.render('editproduct',{message:'Edit failed'})
     }
  } catch (error) {
    
  }
 }

 const deleteProduct = async (req, res) => {
  try {
    await Product.deleteOne({ _id: req.query.id })
    res.redirect("product");
  } catch (error) {
    console.log(error.message);
  }
}

 const addProduct = async(req,res) => {
  try{
    const category = await Category.find({}) 
    res.render('addproduct',{category:category,message: null})
  }
  catch(error){
    console.log(error);
  }
 };  

 const productAdd = async(req,res) => {
  try{
      const product = new Product({
          name: req.body.name, 
          description:req.body.description,
          brand:req.body.brand,
          price:req.body.price,
          category:req.body.category,
          inStock:req.body.stock,
          images:req.files.map((x) => x.filename),
          is_Featured: 0,   
      });   
      const productData = await product.save();
      const category = await Category.find({})
      if (productData) {   
        res.render('addproduct', {category:category,message: "Product addded succesfully" })
    }
    else {
        res.render('addproduct', {category:category,message:"Retry"})
    }
  }catch(error){
    console.log(error);
  } 
};

const loadCoupon = async(req,res) => {
  try {
    const coupon = await Coupon.find({})
    res.render('coupon',{coupon:coupon})
  } catch (error) {
    
  }
};

const saveCoupon = async(req,res) => {
  let couponData
  try {
    const couponnew = await Coupon.findOne({name: req.body.couponname})
    if(couponnew){
      const coupon = await Coupon.find({})
      res.render('coupon',{coupon:coupon,message:'Coupon already exist!!!'})
    }else{
     const coupon = new Coupon({
      name: req.body.couponname, 
      discount:req.body.discount,
      min_value:req.body.minvalue,
      max_discount:req.body.maxdiscount,
      expiry_date:req.body.expiry,
      description:req.body.description  
  });   
  couponData = await coupon.save();
  res.redirect('/admin/coupon')
}
  } catch (error) {
    
  }
}

const deleteCoupon = async (req, res) => {
  try {
    await Coupon.deleteOne({ _id: req.query.id })
    res.redirect('/admin/coupon');
  } catch (error) {
    console.log(error.message);
  }
}

const editCoupon = async(req,res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate({_id:req.body.id},
      {$set:{
      name: req.body.couponname, 
      discount:req.body.discount,
      min_value:req.body.minvalue,
      max_discount:req.body.maxdiscount,
      expiry_date:req.body.expiry,
      description:req.body.description 
    }
  });   
  res.redirect('/admin/coupon')
  } catch (error) {
    
  }
}

const banner = async(req,res) => {
  try {
    const banner = await Banner.find({})
    res.render('banner',{banner:banner})
  } catch (error) {
    
  }
};

const bannerStatus = async(req,res) => {
  try {
    const bannerId = req.query.id;
    console.log(bannerId);
    const banner = await Banner.findById({_id:bannerId})
    if(banner.is_active){
       updated = await Banner.findByIdAndUpdate({_id:bannerId},{$set:{is_active: 0}});
    }
    else{
       updated = await Banner.findByIdAndUpdate({_id:bannerId},{$set:{is_active: 1}});
    }
    res.redirect('/admin/banner')
  } catch (error) {
    
  }
}


const addBanner = async (req, res) => {
  try {
    const newBanner = req.body.banner;
    const a = req.files;
    const banner = new Banner({
      banner: newBanner,
      bannerImage: a.map((x) => x.filename),
    });
    const bannerData = await banner.save();

    if (bannerData) {
      res.redirect("/admin/banner");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const orders = async(req,res) => {
  try {
    const order = await Order.find({}).populate('userId').sort({$natural:-1})
    res.render('orders',{order:order})
  } catch (error) {
    console.log(error);
  }
}


const cancelOrder = async(req,res) => {
  try {
    const orderId = req.query.id
    const orderData = await Order.findByIdAndUpdate({_id:orderId},{$set:{'status':'CANCELLED'}})
    const order = await Order.find({}).populate('userId')
    res.render('orders',{order:order})
  } catch (error) {
    console.log(error);
  }
}

const orderStatus = async(req,res) => {
  try {
    const {orderId,val} = req.body

    const orderData = await Order.findByIdAndUpdate({_id:orderId},{$set:{'status':val}})

  } catch (error) {
    
  }
}


const orderDetails = async(req,res) =>  {
  try {
    const orderId = req.query.id
    const order = await Order.findById({_id:orderId}).populate('userId').populate('products.item.productId').populate('addressId')
    res.render('orderdetails',{orderData:order})
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
    adminLogin,
    verifyLogin,
    loadHome,
    banner,
    addBanner,
    bannerStatus,
    loadCustomers,
    blockUser,
    loadCategory,
    addCategory,
    blockCategory,
    categoryAdd,
    editCategory,
    loadeditCategory,
    loadProduct,
    addProduct,
    productAdd,
    loadeditProduct,
    editProduct,
    deleteProduct,
    loadCoupon,
    saveCoupon,
    deleteCoupon,
    editCoupon,
    orders,
    orderDetails,
    orderStatus,
    cancelOrder,
    logOut
}