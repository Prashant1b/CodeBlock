
const validator=require('validator')
const validate=(data)=>{
    const mandatoryfield=['firstname','emailid','password'];
    const isallow=mandatoryfield.every((k)=>Object.keys(data).includes(k));
    if(!isallow)
        throw new Error("Field Missing");
    if(!validator.isEmail(data.emailid))
        throw new Error("Email format not matched")
    if(!validator.isStrongPassword(data.password))
        throw new Error("Weak Password")
}

module.exports=validate;