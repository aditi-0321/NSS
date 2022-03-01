const dotenv = require("dotenv");
const mongoose = require('mongoose');

dotenv.config({path:'./config.env'});
const URI= process.env.DATABASE;
    mongoose.connect(URI,{
        useUnifiedTopology:true,
        useNewUrlParser:true,
    }).then(()=>{
      console.log('db connected');
    }).catch((_err)=>console.log('db not connected'));