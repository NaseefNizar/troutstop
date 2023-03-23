const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        unique:true,
        uppercase:true,
        required: true,
    },
    is_available: {
        type: Number,
        default: 1,
       
    }
    
})

module.exports = mongoose.model('category',categorySchema)
