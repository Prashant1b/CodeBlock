const mongoose=require('mongoose');

const SubmissionSchema=new mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        requires:true
    },
    problemid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'problem',
        required:true
    },
    code:{
        type:String,
        required:true
    },
    language:{
        type:String,
        required:true,
        enum:['javascript','python','cpp','java']
    },
    status:{
        type:String,
        required:true,
        enum:['pending','accepted','wrong','error'],
        default:'pending'
    },
    runtime:{
        type:Number,
        default:0
    },
    memory:{
        type:Number,
        default:0
    },
    errormessage:{
        type:String,
        default:" "
    },
    testcasepassed:{
        type:Number,
        default:0
    },
    testcasetotal:{
        type:Number,
        default:0
    }
},{
    timestamps:true
});

// SubmissionSchema.index({userId:1,problemid:1}); //Base Combination asending order me arranege karega both problem is and user id 
// SubmissionSchema.index({userId:1,problemid:1,createdAt:-1});//for getting latest submission
// SubmissionSchema.index({userId:1,createdAt:-1}); //All user submission sorted

// SubmissionSchema.index({problemid:1,status:1}); //Problem Statics

const Submission=mongoose.model('Submission',SubmissionSchema);
module.exports=Submission
