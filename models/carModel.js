const mongoose = require('mongoose');
const Joi = require('joi')

const carSchema = new mongoose.Schema({
    name:String,
    info:String,
    category:String,
    img_url:String,
    price:Number,
    date_created:{
      type:Date, default:Date.now()
    },
    user_id:String,
}) 

exports.CarModel = mongoose.model("cars", carSchema);

exports.validateCar = (_reqBody) =>{
    let schemaJoi = Joi.object({
        name: Joi.string().min(2).max(99).required(),
        info: Joi.string().min(2).max(99).required(),
        category: Joi.string().min(2).max(99).required(),
        img_url: Joi.string().min(2).max(999).required(),
        price: Joi.number().min(1).max(9999999).required(),
    })
    return schemaJoi.validate(_reqBody);
}
