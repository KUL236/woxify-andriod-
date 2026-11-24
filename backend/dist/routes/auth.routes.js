"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
exports.authRoutes = (0, express_1.Router)();
exports.authRoutes.post('/register', auth_controller_1.register);
exports.authRoutes.post('/login', auth_controller_1.login);
exports.authRoutes.get('/me', auth_middleware_1.authenticateToken, auth_controller_1.getProfile);
//# sourceMappingURL=auth.routes.js.map