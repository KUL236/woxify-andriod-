"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncateText = exports.sleep = exports.formatBytes = exports.sanitizeFilename = exports.isValidPassword = exports.isValidEmail = void 0;
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
};
exports.isValidEmail = isValidEmail;
const isValidPassword = (password) => password.length >= 8;
exports.isValidPassword = isValidPassword;
const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200);
exports.sanitizeFilename = sanitizeFilename;
const formatBytes = (bytes, decimals = 2) => {
    if (!bytes)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};
exports.formatBytes = formatBytes;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.sleep = sleep;
const truncateText = (text, maxLength) => {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength - 3) + '...';
};
exports.truncateText = truncateText;
//# sourceMappingURL=validation.js.map