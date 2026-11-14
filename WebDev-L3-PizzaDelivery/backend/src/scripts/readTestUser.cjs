require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function readTestUser() {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected!");
        const user = await User.findOne({
            email: "ahmed.test@example.com",
        }).select("-password");

        if(!user) {
            console.log("User not found");
            return;
        }
        console.log("User found successfully!");
        console.log(user);
    }catch(error){
        console.error("Error", error.message);
    }finally{
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }
}
readTestUser();