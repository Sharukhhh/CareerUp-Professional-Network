import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../../models/userModel.js';
import companyModel from '../../models/companyModel.js';
import validator from 'validator';
import twilio from 'twilio';

const twilioSid = "AC031996d9ac58e11fa2157da8e9cf3934";
const twilioToken = "b155a6882fa0d2c808d09e70deb475ab";
const serviceSid = "VAc6d7f1fc4b4c8b056bfc94df5c91cb88";
const client = twilio(twilioSid , twilioToken);


const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10); 

    const hash = await bcrypt.hash(password , salt);

    return hash;
}  

export const register = async (req, res , next) => {
    try {

        let {name , email , phone, role , password} = req.body;
        phone = Number(phone);

        const existingUser = await userModel.findOne({email});
        const existingCompany = await companyModel.findOne({email});

        let existingMobile = await userModel.findOne({phone});
        if(!existingMobile){
            existingMobile = await companyModel.findOne({phone});

            if(existingMobile){
                console.log('ba'); 
                return res.status(401).json({error : 'Account already exists'});
            }
        }

        if(existingUser || existingCompany || existingMobile){
            console.log('ho');
            return res.status(401).json({error : 'Account already exists'});
        }

        const phoneNumberPattern = /^[0-9]{10}$/;
        if (!phoneNumberPattern.test(phone)) {
            console.log('ha');
            return res.status(401).json({ error: 'Invalid phone number' });
        }

        console.log('ngee')
        client.verify.v2       
        .services(serviceSid)
        .verifications.create({ to: `+91${phone}`  , channel: "sms" })
        .then((verification) =>{
            console.log('da');
            res.status(201).json({message : 'OTP send , Verify!'});
        })
        .catch((error) => {
            console.error("Error sending verification request:", error);
            res.status(500).json({ error: 'Failed to send OTP verification' });
        });

    } catch (error) {
        next(error);
        
    }
}

export const otpRegister = async (req, res, next) => {
    try {
        let {name , email , phone, role , password , otp} = req.body;
        otp = Number(otp);

        const existingUser = await userModel.findOne({email});
        const existingCompany = await companyModel.findOne({email});

        let existingMobile = await userModel.findOne({phone})
        if(!existingMobile){
            existingMobile = await companyModel.findOne({phone});

            if(existingMobile){
                return res.status(401).json({error : 'Account already exists'});
            }
        }

        if(existingUser || existingCompany || existingMobile){
            return res.status(401).json({error : 'Account already exists'});
        }

        const phoneNumberPattern = /^[0-9]{10}$/;
        if (!phoneNumberPattern.test(phone)) {
            return res.status(401).json({ error: 'Invalid phone number' });
        }

        client.verify.v2
        .services(serviceSid)
        .verificationChecks.create({ to : '+91' + phone , code : otp})
        .then( async (response) => {
            if(response.status === 'approved'){
                const bcryptedpassword = await hashPassword(password);

                if(role === 'Candidate'){
                    const user = new userModel({
                        name , email , role , phone, password : bcryptedpassword
                    })
        
                    await user.save(); 
                    console.log(user);
        
                    res.status(201).json({user ,message : 'Verification success!'});
        
                } else {
                    const company = new companyModel({
                        name , email , role , phone, password : bcryptedpassword
                    })
        
                    await company.save();
                    console.log(company);
        
                    res.status(201).json({company ,message : 'Verification Success!'});
                }
            } else {
                return res.status(400).json({error : 'Invalid OTP'});
            }
        }).catch((error) => {
            console.log(error , 'otp verify error');
            res.status(400).json({error : 'Invalid OTP'});
        })
        
    } catch (error) {
        next(error);
    }
}


export const login = async (req, res , next) => {
    try {
        const {email , password} = req.body;

        const user = await userModel.findOne({email});

        if(!user){
            const company = await companyModel.findOne({email});

            if(!company){
                return res.status(401).json({error : 'Account Does not exist'});
            }

            if (company.isBlocked) {
                return res.status(401).json({ error: 'Account is blocked' });
            }

            //if company - password verify
            const matchPassword = await bcrypt.compare(password , company.password);

            if(!matchPassword){
                return res.status(401).json({error : 'Inavlid Password'});
            }
            const token = jwt.sign({userId : company.id } , process.env.JWT_SECRET , {expiresIn : '1h'});

            return res.status(200).json({message : 'Login successfully' , token,
            companyData : {
                username : company.name, useremail : company.email , 
                userId : company._id , role : company.role,
            }});
        }

        if (user.isBlocked) {
            return res.status(401).json({ error: 'Account is blocked' });
        }

        //if user - password verify
        const matchPassword = await bcrypt.compare(password , user.password);

        if(!matchPassword){
            return res.status(401).json({error : 'Invalid Password'});
        }

        const token = jwt.sign({userId : user.id } , process.env.JWT_SECRET , {expiresIn : '1h'});

        return res.status(200).json({message : 'Login successfully' , token,
        userData : {
            username : user.name, useremail : user.email ,
            userId : user._id  , role: user.role,
        }});

        
    } catch (error) {
        next(error);
    }
}


export const resendOTP = async (req, res, next) => {
    try {
        let {name , email , phone, role , password} = req.body;
        phone = Number(phone);



    } catch (error) {
        next(error);
    }
}


// *********************************************************************************
// *********************************************************************************

export const googleSignup = async (req, res , next) => {
    try {
        const token = req.body.credential;

        const decodedData = jwt.decode(token);

        const {name , email , picture , jti} = decodedData;

        const user = await userModel.findOne({email});

        if(user){
            return res.status(401).json({error : 'User Already Exist'});
        }

        const newUser = new userModel({
            name , email , profileImage : picture , password : jti , role : 'Candidate' ,
        });

        await newUser.save();

        res.status(201).json({message: 'user saved succesfully'});

    } catch (error) {
        next(error);
    }
}


export const googleLogin = async (req, res , next) => {
    try {
        const token = req.body.credential;

        const decodedData = jwt.decode(token);

        const {name , email , profileImage , jti} = decodedData;

        const user = await userModel.findOne({email : email});

        if(user){

            if (user.isBlocked) {
                return res.status(401).json({ error: 'Account is blocked' });
            }

            let token = jwt.sign({userId : user.id , email : user.email} , process.env.JWT_SECRET, {expiresIn: '1h'});
            res.status(200).json({message : 'Login Successfull' ,  token, 
                userData : {
                    username : user.name , useremail : user.email, role : user.role,
                    userId : user._id,
                    profileImage : profileImage
                }});

        } else {
            res.status(401).json({error : 'User not found'});
        }
    } catch (error) {
        next(error);
    }
}

// *********************************************************************************
// *********************************************************************************