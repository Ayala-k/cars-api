const express = require("express");
const { auth } = require("../middlewares/auth");
const { CarModel, validateCar } = require("../models/carModel")
const router = express.Router();


router.get("/", async (req, res) => {
  return res.json("cars")
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;

  try {
    let data = await CarModel.find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
    res.json(data);
  }

  catch (err) {
    res.status(500).json({ msg: "ERROR ", err })
  }
})


router.get("/search", async (req, res) => {
  try {
    let queryS = req.query.s;
    let searchReg = new RegExp(queryS, "i");

    let data = await CarModel.find({
      $or: [
        { name: searchReg },
        { info: searchReg }
      ]
    }); 

    res.json(data);
  }
  catch (err) {
    res.status(500).json({ msg: "ERROR", err })
  }
})


router.get("/category/:cat", async (req, res) => {
  try {
    let cat=req.params.cat

    let data = await CarModel.find({category:cat})

    res.json(data);
  }
  catch (err) {
    res.status(500).json({ msg: "ERROR", err })
  }
})


router.get("/price", async (req, res) => {
  try {
    let minPrice = parseInt(req.query.min)||0;
    let maxPrice = parseInt(req.query.max)||Number.POSITIVE_INFINITY;

    let data = await CarModel.find({
      price: {
        $gte: minPrice,
        $lte: maxPrice
      }
    });

    res.json(data);
  }
  catch (err) {
    res.status(500).json({ msg: "ERROR", err })
  }
})


router.get("/:id", async (req, res) => {
  try {
    let id=req.params.id

    let data = await CarModel.find({_id:id})

    res.json(data);
  }
  catch (err) {
    res.status(500).json({ msg: "ERROR", err })
  }
})


router.post("/", auth, async (req, res) => {
  let validBody = validateCar(req.body);

  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }

  try {
    let car = new CarModel(req.body);
    car.user_id = req.tokenData._id;
    await car.save();
    res.status(201).json(car);
  }

  catch (err) {
    res.status(500).json({ msg: "ERROR ", err })
  }
})


router.put("/:editId", auth, async (req, res) => {
  let validBody = validateCar(req.body);

  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }

  try {
    let editId = req.params.editId;
    let data;

    if (req.tokenData.role == "admin") {
      data = await CarModel.updateOne({ _id: editId }, req.body)
    }

    else {
      data = await CarModel.updateOne({ _id: editId, user_id: req.tokenData._id }, req.body)
    }

    res.json(data);
  }

  catch (err) {
    res.status(500).json({ msg: "ERROR", err })
  }
})


router.delete("/:delId", auth, async (req, res) => {
  try {
    let delId = req.params.delId;
    let data;

    if (req.tokenData.role == "admin") {
      data = await CarModel.deleteOne({ _id: delId })
    }

    else {
      data = await CarModel.deleteOne({ _id: delId, user_id: req.tokenData._id })
    }

    res.json(data);
  }

  catch (err) {
    res.status(500).json({ msg: "ERROR", err })
  }
})

module.exports = router;