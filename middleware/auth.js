const User = require('../models/userModel')

const isLogin = async (req, res, next) => {
    try {
      if (req.session.user_id ) {
        const userData = await User.findById({_id:req.session.user_id})
       if(userData.is_blocked == 1){
        req.session.user_id = null;
        req.session.user = null;
        req.session.user1 = false;
        res.redirect("/login");
       }else{
        next()
         }
      }else{
        res.redirect("/login");
        // next()
      }
    } catch (error) {
      console.log(error.message);
    }
  };
    
  const isLogout = async (req, res, next) => {
    try {
      if (req.session.user_id) {
        res.redirect("/");
      }
      else{
      next(); 
      }
    } catch (error) {
      console.log(error.message);
    }
  }



  
  module.exports = {
    isLogin,
    isLogout,
  };
  

  