import dotenv from "dotenv"
import ConnectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path : './.env'
})

ConnectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MONGODB connection failed !!", err)
})
















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