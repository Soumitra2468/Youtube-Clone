import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";


const connectDB = async () => {
    try {
       const connIns = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        process.on("error", (err) => {
            console.log("Error connecting to MongoDB:", err);
            throw err;
        });
        console.log(`✅ MongoDB connected: ${connIns.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        process.exit(1); // Exit process on failure
    }
};


export default connectDB;