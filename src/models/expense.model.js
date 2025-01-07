import mongoose, {Schema} from 'mongoose'
// hve to create expense model which include amount, category, description, date


const expenseSchema=new Schema({
    
    amount:Number,
    description:String,
    category:String,
    date:Date,
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

},{
    timestamps:true
})


export const Expense = mongoose.model("Expense", expenseSchema)


