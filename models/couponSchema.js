const mongoose = require('mongoose');


const couponSchema = mongoose.Schema({
name:{
    type:String,
    unique:true,
    uppercase:true,
    required:true
},

discount:{
    type:Number,
    required:true
},

description:{
    type:String,
    required:true
},

min_value:{
    type:Number,
    required:true
},

max_discount:{
    type:Number,
    required:true
},

expiry_date:{
    type:Date,
    required:true
},

maxUses:{
    type:Number,
    default:1
}

})

module.exports = mongoose.model('coupon', couponSchema)