const mongoose=require('mongoose');

const userschema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        minLength:3,
        maxLength:20
    },
    lastname:{
        type:String,
        minLength:3,
        maxLength:20
    },
     emailid:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true
     },
     phoneNumber: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
     },
     age:{
        type:Number,
        min:6,
        max:60
     },
     role:{
        type:String,
        enum:['admin','user'],
        default:'user'
     },
     problemsolved:{
        type:[{
         type:mongoose.Schema.Types.ObjectId,
         ref:"problem"
        }],
        unique:true

     },
     password:{
        type:String,
        minLength:8,
        required:true
     }

},{
    timestamps:true
});

const User=mongoose.model('user',userschema);

module.exports=User;
