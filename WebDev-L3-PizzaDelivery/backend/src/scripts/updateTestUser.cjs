require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function updateTestUser() {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");

        const updatedUser = await User.findOneAndUpdate(
            {email: "ahmed.test@example.com"},
            {address: "Alexandria, Egypt"},
            {returnDocument: "after", runValidators: true}
        ).select("-password");

        if(!updatedUser) {
            console,log("User not found");
            return;
        }
        console.log("User updated successfully!");
        console.log(updatedUser);
    }catch(error) {
        console.error("Error:", error.message);
    }finally{
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }
}
updateTestUser();