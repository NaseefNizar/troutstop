const mongoose = require('mongoose')
// const Product = require('../models/productSchema')
// const User = require('../models/userModel')
// const Address = require("../models/addressSchema")

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
      },
    addressId:{
        type:mongoose.Types.ObjectId,
        ref:'address',
        required:true
    },
    payment:{
        type:String,
        required:true
    },
    products:{
        item:[{
            productId:{
                type:mongoose.Types.ObjectId,
                ref:'product',
            },
            qty:{
                type:Number,
            },
            price:{
                type:Number,
            }
        }],
        totalPrice:{
            type:Number,
            default:0
        }
    },
    // orderedAt:{
    //     type:Date,
    //     immutable:true,
    //     default:Date.now()
    // },
    orderedAt: {
        type: Date,
        immutable: true,
        default: function() {
          return new Date();
        }
      },
    status:{
        type:String,
        default:"IN PROCESS"
    }
    // paymentStatus:{
    //     type:String,
    //     default:0
    // },
    // razorpayPaymentId: {
    //     type:String,
    //     default:0
    // },
    // razorpayOrderId: {
    //     type:String,
    //     default:0
    // },
    // razorpaySignature: {
    //     type:String,
    //     default:0
    // }
})




module.exports = mongoose.model('order',orderSchema)