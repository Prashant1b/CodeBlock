const {createClient} =require('redis');
const redisClient = createClient({
    username: 'default',
    password: process.env.Redispassword,
    socket: {
        host: 'redis-13191.c57.us-east-1-4.ec2.cloud.redislabs.com',
        port: 13191
    }
}); 

module.exports=redisClient;
