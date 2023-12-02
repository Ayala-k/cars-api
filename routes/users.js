const express = require("express");
const bcrypt = require("bcrypt");
const { auth, authAdmin } = require("../middlewares/auth");
const { UserModel, validateUser, validateLogin, createToken } = require("../models/userModel")
const router = express.Router();


router.get("/myInfo", auth, async (req, res) => {
  try {
    let userInfo = await UserModel.findOne({ _id: req.tokenData._id }, { password: 0 });
    res.json(userInfo);
  }
  catch (err) {
    res.status(500).json({ msg: "ERROR ", err })
  }
})


router.get("/usersList", authAdmin, async (req, res) => {
  try {
    let data = await UserModel.find({}, { password: 0 });
    res.json(data)
  }
  catch (err) {
    res.status(500).json({ msg: "ERROR ", err })
  }
})


router.post("/", async (req, res) => {
  let validBody = validateUser(req.body);

  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }

  try {
    let user = new UserModel(req.body);
    user.password = await bcrypt.hash(user.password, 10);

    await user.save();
    user.password = "*****";
    res.status(201).json(user);
  }

  catch (err) {
    if (err.code == 11000) {
      return res.status(500).json({ msg: "EMAIL ALREADY EXISTS", code: 11000 })
    }

    res.status(500).json({ msg: "ERROR ", err })
  }
})


router.post("/login", async (req, res) => {
  let validBody = validateLogin(req.body);

  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }

  try {
    let user = await UserModel.findOne({ email: req.body.email })
    if (!user) {
      return res.status(401).json({ msg: "EMAIL NOT EXIST" })
    }

    let authPassword = await bcrypt.compare(req.body.password, user.password);
    if (!authPassword) {
      return res.status(401).json({ msg: "WRONG PASSWORD" });
    }

    let token = createToken(user._id, user.role);
    res.json({ token });
  }

  catch (err) {
    res.status(500).json({ msg: "ERROR ", err })
  }
})


router.put("/:editId", auth, async (req, res) => {
  let validBody = validateUser(req.body);

  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }

  try {
    let editId = req.params.editId;
    let data;

    let user=req.body
    user.password = await bcrypt.hash(user.password, 10);


    if (req.tokenData.role == "admin") {
      data = await UserModel.updateOne({ _id: editId }, user)
    }

    else {
      if (editId != req.tokenData._id) {
        return res.status(400).json("YOU ARE NOT ALLOWED TO CHANGE OTHER USER'S DETAILS");
      }
      data = await UserModel.updateOne({ _id: editId }, user)
    }

    user.password = "*****";
    res.json(user);
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
      data = await UserModel.deleteOne({ _id: delId })
    }

    else {
      if (delId != req.tokenData._id) {
        return res.status(400).json("YOU ARE NOT ALLOWED TO DELETE OTHER USER'S DETAILS");
      }
      data = await UserModel.deleteOne({ _id: delId })
    }

    res.json(data);
  }

  catch (err) {
    res.status(500).json({ msg: "ERROR", err })
  }
})


module.exports = router;