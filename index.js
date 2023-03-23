const mongoose = require("mongoose");
const express = require("express");
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();
const nocache = require('nocache')
mongoose.set('strictQuery', false);

DB = process.env.DBURL;
mongoose.connect(DB);





const app = express();

const {PORT} = process.env;
const port = 3000 || PORT


app.set('views', './views');
app.set('view engine','ejs');

app.use(nocache())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(mongoSanitize());


const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);

app.all('*',function(req,res){
  res.status(404).render('404.ejs')
})

app.listen(port, function () { 
  console.log(`server is running at ${port}`);
});
