import { Hono } from 'hono';
import { createExpense, deleteExpense, listFamilyExpenses, listMyExpenses, updateExpense } from '../controllers/expenses.js';
import type { AppEnv } from '../types.js';

export const expenseRoutes = new Hono<AppEnv>();
expenseRoutes.get('/expenses/mine', listMyExpenses);
expenseRoutes.get('/expenses/family', listFamilyExpenses);
expenseRoutes.post('/expenses', createExpense);
expenseRoutes.patch('/expenses/:id', updateExpense);
expenseRoutes.delete('/expenses/:id', deleteExpense);
