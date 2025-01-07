import mongoose from "mongoose";

 const connectDB =async ()=>{
    const key=process.env.MONGODB_URI
    // console.log(key)
    try {
        const connectionInstance = await mongoose.connect(  key, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
        console.log(`\n Mongo Db is connected Successfull !! DB Host: ${connectionInstance.connection.host}`)
        
    } catch (error) {
        console.log("MongoDb connection Error",error)
        process.exit(1)
        
    }

}

export default connectDB;