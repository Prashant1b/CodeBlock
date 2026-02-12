const redisClient = require("../config/redis");
const SubmitcodeRatelimiter=async(req,res,next)=>{
        const userid=req.user._id;
        const rediskey=`submit_cooldown:${userid}`;
        try {
            const exists=await redisClient.exists(rediskey);
            if(exists){
                return res.status(429).json({
               error:"Please wait 10 seconds before Submitting again"
                })
            }

            await redisClient.set(rediskey,'cooldown_active',{
                EX:10,
                NX:true
            });

            next();

        } catch (error) {
            res.status(500).send("Error "+error.message);
        }
}

module.exports=SubmitcodeRatelimiter;