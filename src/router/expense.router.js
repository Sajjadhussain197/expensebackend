import { Router } from "express";
import {  
createExpense,
getExpenses,
updateExpense,
deleteExpense,
getExpenseSummary,
getexpense
} from "../controller/expense.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
const router=Router();
router.route("/create").post(verifyJWT,createExpense)
router.route("/getexpense").get(verifyJWT,getexpense)
router.route("/getall").get(verifyJWT,getExpenses)
router.route("/update/:id").put(verifyJWT,updateExpense)
router.route("/delete/:id").delete(verifyJWT,deleteExpense)
router.route("/getexpensebysummary").get(verifyJWT,isAdmin,getExpenseSummary)

export default router;