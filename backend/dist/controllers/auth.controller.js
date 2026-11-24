"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const logger_1 = require("../utils/logger");
const generateToken = (user) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET not configured');
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name }, secret, { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') });
};
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ error: 'Name, email, and password are required' });
            return;
        }
        if (password.length < 8) {
            res.status(400).json({ error: 'Password must be at least 8 characters long' });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ error: 'Invalid email address' });
            return;
        }
        const existing = await user_model_1.UserModel.findByEmail(email);
        if (existing) {
            res.status(409).json({ error: 'An account with this email already exists' });
            return;
        }
        const user = await user_model_1.UserModel.create({ name, email, password });
        const token = generateToken({ id: user.id, email: user.email, name: user.name });
        logger_1.logger.info(`New user registered: ${email}`);
        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email },
        });
    }
    catch (error) {
        logger_1.logger.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const user = await user_model_1.UserModel.findByEmail(email);
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const isValidPassword = await user_model_1.UserModel.comparePassword(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const token = generateToken({ id: user.id, email: user.email, name: user.name });
        logger_1.logger.info(`User logged in: ${email}`);
        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email },
        });
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const user = await user_model_1.UserModel.findById(req.user.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at } });
    }
    catch (error) {
        logger_1.logger.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=auth.controller.js.map