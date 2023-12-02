const usersRoute = require("./users");
const carsRoute = require("./cars");

exports.routesInit = (app) => {
  app.use("/users",usersRoute);
  app.use("/cars",carsRoute)
}