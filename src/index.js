import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    server.on("error", (err) => {
      console.error("Server error:", err);
      throw err;
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });





















/*
import express from "express";
const app = express();
;(async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error", (err) => {
           console.log("Error connecting to MongoDB:", err);
           throw err;
       });
         app.listen(process.env.PORT, () => {
              console.log(`Server is running on port ${process.env.PORT}`);
         });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
})()
*/    

