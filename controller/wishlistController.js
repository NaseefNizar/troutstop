const User = require("../models/userModel");
const Product = require("../models/productSchema");



const addWishlist = async (req, res) => {
    try {
      if (req.session.user_id) {
        const userData = await User.findById({ _id: req.session.user_id });
        const productId = req.body.productId;
        const product = await Product.findById({ _id: productId });
        userData.addToWishlist(product);
        res.json({ status: true });
      }
      else {
        res.json({ status: false });
  
      }
    } catch (error) { }
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
      res.render("wishlist", { items: userData.wishlist.item, user: check });
    } catch (error) { }
  };
  
  const deleteWishlistItem = async (req, res) => {
    try {
      const productid = req.query.id;
      const userid = req.session.user_id;
      const userData = await User.findOne({ _id: userid });
      userData.removefromWishlist(productid);
      res.redirect("/wishlist");
    } catch (error) { }
  };

module.exports = {
    addWishlist,
    showWishlist,
    deleteWishlistItem,
}