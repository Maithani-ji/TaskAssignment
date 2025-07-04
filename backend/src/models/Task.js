import mongoose from "mongoose";

const taskSchema= new mongoose.Schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    dueDate:{type:Date,required:true,
            validate:{
                validator:(value)=>{
                    if(value && (new Date(value) < new Date()))
                    {
                        throw new Error("Due date must be a future date")
                    }
                    return true;
                },
                message:"Due date must be a future date",
            },
    },
    status:{type:String,enum:["pending","completed"], default:"pending"},
    assignedTo:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
},{
    timestamps: true, // Automatically add createdAt and updatedAt fields to the schema.
    strict: "throw",
})

// INSTANCE METHOD for getting overdue status of a task 

taskSchema.methods.getOverdueStatus = function() {
 return new Date(this.dueDate) < new Date()
}

const Task= mongoose.model("Task",taskSchema)

export default Task