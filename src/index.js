import dotenv from 'dotenv'
import connectDB from "./db/index.js";
import { app } from './app.js';
import log from './utils/logger.js';

dotenv.config({path: './.env'})


connectDB().
then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        log.info(`Server is running on port: ${process.env.PORT}`)
        // console.log(`Server is running on port: ${process.env.PORT}`)
    } )
})
.catch((error)=>{
    
    log.error("MongoDb connnection failed !!", error)
    console.log("MongoDb connnection failed !!", error )
})