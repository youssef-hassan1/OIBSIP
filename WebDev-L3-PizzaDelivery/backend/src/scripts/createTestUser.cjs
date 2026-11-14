require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
console.log("User:", typeof User);
console.log("User.create:", typeof User.create);
console.log("Model name:", User.modelName);

async function createTestUser(){
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected!");
        const hashedPassword = await bcrypt.hash(
            "TestPassword123",
            10
        );
        const newUser = new User({
        name: "Ahmed Mohamed",
        email: "ahmed.test@example.com",
        password: hashedPassword,
        phone: "01012345678",
        address: "Kafr El-Sheikh",


        });
        await newUser.save();

        console.log("User created succsessfully!");
        console.log(newUser);
    }catch (error){
        console.error("Full error:", error);
    }finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }
}
createTestUser();