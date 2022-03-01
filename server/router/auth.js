const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcryptjs');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

require('../db/connection');
const User = require("../model/userSchema");
router.get('/',(req,res) =>{
    res.send(`hello world from home router`);
   
  });
/*
  router.post('/register',(req,res)=>{
    const {name,email,phone,work,password,cpassword}=req.body;
    if(!name||!email||!phone||!work||!password||!cpassword){
      return res.sendStatus(422).json({error:"Pls Fill All The Feilds"});
    }
   User.findOne({email:email})
    .then((userExist)=>{
      if(userExist){
        return res.status(422).json({error:"Email already exist"});
      }
      const user = new User({name,email,phone,work,password,cpassword});
      user.save().then(()=>{
        res.status(201).json({message:"user registered successfully"});
      }).catch((err)=>res.status(500).json({error:"Failed to register"}));
    }).catch(err=>{console.log(err);});
  });*/
  router.post('/register',async(req,res)=>{
    const {name,email,phone,work,password,cpassword}=req.body;
    if(!name||!email||!phone||!work||!password||!cpassword){
      return res.status(422).json({error:"Pls Fill All The Feilds"});
    }
    try{
        const userExist = await User.findOne({email:email});
        if(userExist){
          return res.status(422).json({error:"Email already exist"});
        }else if(password!=cpassword){
          return res.status(422).json({error:"password are not matching"});
        }else{
          const user = new User({name,email,phone,work,password,cpassword});
          await user.save();
          res.status(201).json({message:"user registered successfully"});
        }
        
    }
    catch(err){
      console.log(err);
    }

  });

  router.post('/login',async(req,res)=>{
    try{
      let token;
      const{email,password}=req.body;
      if(!email || !password){
        return res.status(400).json({error:"Pls fill data"})
      }
      const userLogin = await User.findOne({email:email});
      if(userLogin)
      {
      const isMatch = await bcrypt.compare(password,userLogin.password);
      token = await userLogin.generateAuthToken();
      console.log(token);
      res.cookie("jwtoken",token,{
        expires:new Date(Date.now()+25892000000),
        httpOnly:true
      });
      if(!isMatch)
       {
         res.status(400).json({error:"Invalid Credentials"});
       }
       else{
         res.json({message:"user Signin Successfully"});
       }
      }else{
        res.status(400).json({error:"Invalid Credentials"});
      }

    }catch(err){
      console.log(err);
    }
  });
  router.get('/aboutme',authenticate,(req,res) =>{
    console.log(`Hello About`);
    res.send(req.rootUser);
  });
  router.get('/getdata',authenticate,(req,res)=>{
    console.log(`Hello About`);
    res.send(req.rootUser);
  })
  router.post('/contact',authenticate,async(req,res) =>{
    try{
      const {name,email,phone,message}=req.body;
      if(!name||!email||!phone||!message){
        console.log("error in contact form");
        return res.json({error:"Plss fill the contact form"});
      }
      const userContact = await User.findOne({_id:req.userID});
      if(userContact){
        const userMessage = await userContact.addMessage(name,email,phone,message);
        await userContact.save();
        res.status(201).json({message:"User Contact Successfully"});
      }
    }catch(error){
      console.log(error);
    }
  });

  //logout Page
  router.get('/logout',(req,res)=>{
    console.log(`Hello logout`);
    res.clearCookie('jwtoken',{path:'/'});
    res.status(200).send('user logout');
  })
  module.exports = router;