const jwt = require("jsonwebtoken");
const { config } = require("../config/secret")

exports.auth = (req, res, next) => {
  let token = req.header("x-api-key");

  if (!token) {
    return res.status(401).json({ msg: "PLEASE SEND TOKEN" })
  }

  try {
    let decodeToken = jwt.verify(token, config.tokenSecret);
    req.tokenData = decodeToken;

    next();
  }

  catch (err) {
    return res.status(401).json({ msg: "TOKEN INVALID OR EXPIRED" })
  }
}


exports.authAdmin = (req, res, next) => {
  let token = req.header("x-api-key");

  if (!token) {
    return res.status(401).json({ msg: "PLEASE SEND TOKEN" })
  }

  try {
    let decodeToken = jwt.verify(token, config.tokenSecret);

    if (decodeToken.role != "admin") {
      return res.status(401).json({ msg: "PLEASE SEND ADMIN TOKEN" })
    }

    req.tokenData = decodeToken;

    next();
  }

  catch (err) {
    return res.status(401).json({ msg: "TOKEN INVALID OR EXPIRED" })
  }
}