const mongoose=require('mongoose');

async function main() {
   await mongoose.connect(process.env.MONGODBURL)
   
}

module.exports=main
