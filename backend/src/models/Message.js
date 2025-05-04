import mongoose from "mongoose";

const messageSchema= new mongoose.Schema(
    {
        room:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Room",
            required:true,
        },
        sender:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        content:{type:String,required:true},
        status:{
            type:String,
            enum:["sent","seen","delivered","failed"],
            default:"sent",
        },
        seenInfo:[
            {
        seenBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
        seenAt:{type:Date},
            },
    ],
     // Temporary ID to show the message instantly on the frontend
     tempId: { type: String, required: true },  // Temp ID (for frontend use)    
    },
    {timestamps: true,strict:"throw"},
)
messageSchema.index({ room: 1, createdAt: -1 }); // Fetch latest messages efficiently

export const Message=mongoose.model("Message",messageSchema)
