import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
       
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        },
        role: {
            type: String,
            enum: ['admin', 'user'], // Define the valid roles here
            default: 'user', // Set a default role if needed
          },

    },
    {
        timestamps: true
    }
)

  userSchema.pre('save', async function(next) {
    try {
        // Only hash the password if it's modified or new
        if (!this.isModified('password')) {
            return next();
        }

        // Hash the password with bcrypt
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;

        next();
    } catch (error) {
        next(error); // Pass the error to Mongoose's middleware chain
    }
});


  userSchema.methods.isPasswordCorrect = async function(password) {
    try {


        // Compare password with hashed password stored in the database
        const isMatch = await bcrypt.compare(password, this.password);
        console.log(isMatch)

        return isMatch;
    } catch (error) {
        throw error;
    }
};

  userSchema.methods.generateAccessToken =  function(){
    const key=process.env.ACCESS_TOKEN_SECRET
    const expire=process.env.ACCESS_TOKEN_EXPIRY
   return jwt.sign({
        _id:this._id,
        username:this.username,
        email:this.email,
        fullName:this.fullName
    },
    key,
    {
        expiresIn:expire
    }    
)
  };
  userSchema.methods.generateRefreshToken =  function(){
    const key=process.env.REFRESH_TOKEN_SECRET
    const expire=process.env.REFRESH_TOKEN_EXPIRY
    console.log(key,expire)
    return jwt.sign({
        _id:this.id
    },
    key
    ,
    {
        expiresIn:expire
    }    )
  };

export const User = mongoose.model("User", userSchema)