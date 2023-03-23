const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: Array,
    },
    brand: {
        type:String,
        required: true
    },
    price: {
        type: Number,
        required:true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    inStock:{
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    is_Available: {
        type: Boolean,
        default: 0
    }


})

module.exports = mongoose.model('product',productSchema)
