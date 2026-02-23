  const express = require('express');
  const app = express();
  const dotenv = require('dotenv')
  dotenv.config();
  const main = require('./config/db');
  const cookieparser=require('cookie-parser')
  const router=require("./route/userAuth");
  const redisClient = require('./config/redis');
  const problemrouter = require('./route/problemsetter');
  const cors = require("cors");
  const submitrouter=require('./route/Submit');
  app.use(
  cors({
    origin: ["https://codeblocks.onrender.com"],
    credentials: true,
  })
);

  app.use(express.json());
  app.use(cookieparser());

  app.use("/user",router);
  app.use("/leetcode",problemrouter);
  app.use("/problem",submitrouter);

  const Initaliseconnection=async()=>{
      try{
          await Promise.all([main(),redisClient.connect()]);
          console.log("DB connected")
                  app.listen(process.env.PORT, () => {
                  console.log("Server is listen on the port: " + process.env.PORT)
            })
      }
      catch(err){
          console.log(err.message)
      }
  }

  Initaliseconnection();

  // main()
  //     .then(async () => {
  //        console.log("connected to mongodb")
  //         app.listen(process.env.PORT, () => {
  //             console.log("Server is listen on the port: " + process.env.PORT)
  //         })
  //     })
  // .catch(err=>console.log(err.message))




