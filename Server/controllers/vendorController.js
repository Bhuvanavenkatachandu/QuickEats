const Vendor = require('../models/Vendor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const secretKey=process.env.whatisurname

const vendorRegister = async(req,res)=>{
    const {username,email,password}=req.body;
    try{
        const vendorEmail=await Vendor.findOne({email});
        if(vendorEmail){
            return res.status(400).json({message:"Vendor already exists"});
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newVendor = new Vendor({
            username,email,password:hashedPassword
        });
        await newVendor.save();   // saving in MongoDB
        res.status(201).json({message:"Vendor registered successfully"});
        console.log("Registered");
    }catch(error){
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const vendorLogin = async(req,res)=>{
    const {email,password}=req.body;
    try{
        const vendor= await Vendor.findOne({email});
        if(!vendor || !(await bcrypt.compare(password,vendor.password))){
            return res.status(401).json({ error : "Invalid username and password"});
        }
        const token=jwt.sign({ vendorId: vendor._id},secretKey,{expiresIn:"1h"})
        res.status(201).json({ success : "login successful", token, vendorId: vendor._id});
        console.log(email);
        console.log("this is token", token);
    }catch(error){
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getAllvendors=async (req,res)=>{
    try {
        const vendors=await Vendor.find().populate('firm')
        res.status(200).json({vendors});
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getVendorid=async (req,res)=>{
    const vendorId=req.params.vendorId;
    try {
        const vendor=await Vendor.findById(vendorId).populate('firm');
        if(!vendor){
            return res.status(401).json({ error : "Vendor not found"});
        }
        res.status(200).json({vendor});
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports ={vendorRegister,vendorLogin ,getAllvendors , getVendorid};