import { Expense } from "../models/expense.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from 'mongoose';

const isValidDate = (date) => !isNaN(Date.parse(date));

const createExpense = asyncHandler(async (req, res, next) => {
    const { amount, description, category, date } = req.body;

    // Validate input
    if (!amount || !description || !category || !date) {
        return next(new ApiError(400, "All fields are required"));
    }

    if (amount <= 0) {
        return next(new ApiError(400, "Amount should be a positive value"));
    }

    if (!isValidDate(date)) {
        return next(new ApiError(400, "Invalid date format"));
    }

    try {
        const expense = await Expense.create({
            amount: Math.round(amount * 100), // Convert to cents
            description,
            category,
            date
        });

        res.status(200).json(new ApiResponse(200, expense, "Expense created successfully"));
    } catch (error) {
        return next(new ApiError(500, "Something went wrong while creating expense", error));
    }
});

const getExpenses = asyncHandler(async (req, res) => {
    const {
        start_date,
        end_date,
        category,
        amount_min,
        amount_max,
        page = 1,
        limit = 10
    } = req.query;

    const filters = {};

    if (start_date && isValidDate(start_date)) {
        filters.date = { $gte: new Date(start_date) };
    }
    if (end_date && isValidDate(end_date)) {
        filters.date = { ...filters.date, $lte: new Date(end_date) };
    }
    if (category) {
        filters.category = category;
    }
    if (amount_min) {
        filters.amount = { $gte: parseInt(amount_min) * 100 };
    }
    if (amount_max) {
        filters.amount = { ...filters.amount, $lte: parseInt(amount_max) * 100 };
    }

    try {
        const expenses = await Expense.aggregate([
            { $match: filters },
            { $sort: { date: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
        ]);

        const totalExpenses = await Expense.countDocuments(filters);

        res.status(200).json(new ApiResponse(200, { expenses, totalExpenses }, "Expenses retrieved successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Something went wrong while retrieving expenses", error));
    }
});

// PUT /expenses/{id}: Update an existing expense by id
const updateExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, description, category, date } = req.body;

    const expense = await Expense.findById(id);
    if (!expense) {
        return res.status(404).json(new ApiError(404, "Expense not found"));
    }

    if (amount && amount <= 0) {
        return res.status(400).json(new ApiError(400, "Amount should be positive"));
    }

    if (date && !isValidDate(date)) {
        return res.status(400).json(new ApiError(400, "Invalid date format"));
    }

    try {
        const updatedExpense = await Expense.findByIdAndUpdate(id, {
            amount: amount ? Math.round(amount * 100) : expense.amount, // Update amount if provided
            description: description || expense.description,
            category: category || expense.category,
            date: date || expense.date
        }, { new: true });

        res.status(200).json(new ApiResponse(200, updatedExpense, "Expense updated successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Something went wrong while updating expense", error));
    }
});

// DELETE /expenses/{id}: Delete an expense by id
const deleteExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const expense = await Expense.findById(id);
    if (!expense) {
        return res.status(404).json(new ApiError(404, "Expense not found"));
    }

    try {
        await Expense.findByIdAndDelete(id);
        res.status(200).json(new ApiResponse(200, null, "Expense deleted successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Something went wrong while deleting expense", error));
    }
});

// GET /summary: Provide a summary of expenses for a given date range
const getExpenseSummary = asyncHandler(async (req, res) => {
    const { start_date, end_date } = req.query;

    const filters = {};

    if (start_date && isValidDate(start_date)) {
        filters.date = { $gte: new Date(start_date) };
    }
    if (end_date && isValidDate(end_date)) {
        filters.date = { ...filters.date, $lte: new Date(end_date) };
    }

    try {
        const totalExpenses = await Expense.aggregate([
            { $match: filters },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const categorizedExpenses = await Expense.aggregate([
            { $match: filters },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } }
        ]);

        const topExpenses = await Expense.aggregate([
            { $match: filters },
            { $sort: { amount: -1 } },
            { $limit: 3 }
        ]);

        res.status(200).json(new ApiResponse(200, {
            totalExpenses: totalExpenses[0]?.total || 0,
            categorizedExpenses,
            topExpenses
        }, "Expense summary retrieved successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Something went wrong while retrieving summary", error));
    }
});
// GET /expenses: List expenses with filtering by start_date, end_date, category, amount_min, amount_max, and owner
const getexpense = asyncHandler(async (req, res) => {
    const {
        start_date,
        end_date,
        category,
        amount_min,
        amount_max,
        owner_id,  // Added owner_id filter
        page = 1,
        limit = 10
    } = req.query;

    const filters = {};

    // Date filtering
    if (start_date && isValidDate(start_date)) {
        filters.date = { $gte: new Date(start_date) };
    }
    if (end_date && isValidDate(end_date)) {
        filters.date = { ...filters.date, $lte: new Date(end_date) };
    }
    if (category) {
        filters.category = category;
    }
    if (amount_min) {
        filters.amount = { $gte: parseInt(amount_min) * 100 };
    }
    if (amount_max) {
        filters.amount = { ...filters.amount, $lte: parseInt(amount_max) * 100 };
    }
    if (owner_id) {
        filters.owner = owner_id;  // Filter by owner ID
    }

    try {
        // Using aggregation to filter and paginate the expenses
        const expenses = await Expense.aggregate([
            { $match: filters },
            { $sort: { date: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
        ]);

        const totalExpenses = await Expense.countDocuments(filters);

        res.status(200).json(new ApiResponse(200, { expenses, totalExpenses }, "Expenses retrieved successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, "Something went wrong while retrieving expenses", error));
    }
});


export {
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
    getExpenseSummary,
    getexpense
};
