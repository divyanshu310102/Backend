import dotenv from "dotenv"
import ConnectDB from "./db/index.js"

dotenv.config({
    path : './env'
})

ConnectDB();
















/*

import express from 'express';
const app = express()

// Connect to MongoDB
;(async () => {
   try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error", (error) => {
        console.log("MongoDB connection error:", error);
        throw error
    })

    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`)
    })
   } catch (error) {
    console.log("ERROR: ",error);
    throw error;
   }
})()
   */