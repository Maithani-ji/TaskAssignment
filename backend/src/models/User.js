import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return typeof v === "string" && isNaN(v);  // ✅ Prevents numbers being auto-converted
            },
            message: "Name must be a non-numeric string!",
        },
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verificationToken: { type: String },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["manager", "employee"], default: "employee" },
}, {
    timestamps: true,
    strict: "throw", // ✅ This prevents extra fields like "iddd"
});

// Schema Middileware for document-> save(),validate().remove()  and query ->.find() .findOneAndDelete() (cascading deletion) 
userSchema.pre("save", async function(next){
    //  will get the document itself in this 
    console.log("schema middidleware called",this)
    next()
})
userSchema.pre("findOneAndDelete", function(next) {
    // will get the working query of document and not the dcument itself
    console.log("About to update user:", this._conditions,this);
    next();
  });
// static methods and instance methods :::: use normal function as "this" keyword wont work in arrwo functino and gives you undefined

// get user by email // STATIC METHOD
userSchema.statics.getUserByEmailStaticMethod=async function (email){
    const user = await this.findOne({email}).select("-password").lean();
    return user
}




const User=mongoose.model("User",userSchema)


// Instance method 
export default User;