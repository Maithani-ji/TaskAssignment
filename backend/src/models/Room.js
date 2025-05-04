
import mongoose from "mongoose";

const roomSchema= new mongoose.Schema(
    {
        task:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Task",
            required:true,
            unique:true,
        },
        members:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        }],
        createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    },
    {timestamps: true,strict:"throw"},
)

export const Room=mongoose.model("Room",roomSchema)
