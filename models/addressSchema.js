const mongoose = require('mongoose')
const User = require('../models/userModel');

const addressSchema = new mongoose.Schema({
      userId: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
      },
      firstname: {
        type: String,
        required: true
      },
      lastname: {
        type: String,
        required: true
      },
      housename: {
        type: String,
        required: true
      },
      locality: {
        type: String
      },
      landmark: {
        type:String
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      pincode: {
        type: String,
        required: true
      },
      mobile: {
        type: Number,
        required: true
      },
      is_deleted:{
        type: Number,
        default: 0
      }
})




module.exports = mongoose.model('address', addressSchema)