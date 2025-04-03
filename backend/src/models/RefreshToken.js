import mongoose from "mongoose";

const refreshTokenSchema= new mongoose.Schema(
    {
        userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
        token:{type:String,required:true,unique:true},
        expiresAt:{type:Date,required:true},

    }
    ,{
        timestamps: true, // Automatically add createdAt and updatedAt fields to the schema.
        strict: "throw",
    },
)

export const RefreshToken=mongoose.model("RefreshToken",refreshTokenSchema)
