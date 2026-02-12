const jwt=require("jsonwebtoken");
const User = require('../models/user');
const redisClient = require("../config/redis");

const middleware=async (req,res,next)=>{
     try{
         const token=req.cookies.token;
         if(!token) throw new Error("Token is missing");
          const payload=jwt.verify(token , process.env.key);
            const {_id}=payload;
            if(!_id) throw new Error("Id is missing");
            const user=await User.findById(_id);
            if(!user) throw new Error("User doesn't exists");
            // aab ham check karnege ki redis ke block list me to nhi hai
            const isblocked=await redisClient.exists(`blocked_${token}`);
            if(isblocked) throw new Error("Invalid token");
            req.user=user;
            next();
     } 
     catch(err){
        res.status(401).send("Error "+ err.message);
     }
}

module.exports=middleware;
