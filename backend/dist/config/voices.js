"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUALITY_OPTIONS = exports.VOLUME_OPTIONS = exports.SPEED_OPTIONS = exports.VOICES = void 0;
exports.VOICES = [
    {
        id: "male",
        name: "Male Voice",
        gender: "male",
        language: "all",
    },
    {
        id: "female",
        name: "Female Voice",
        gender: "female",
        language: "all",
    },
];
exports.SPEED_OPTIONS = [
    { label: "0.5x", value: 0.5 },
    { label: "0.75x", value: 0.75 },
    { label: "1x (Normal)", value: 1 },
    { label: "1.25x", value: 1.25 },
    { label: "1.5x", value: 1.5 },
    { label: "2x", value: 2 },
];
exports.VOLUME_OPTIONS = [
    { label: "0%", value: 0 },
    { label: "25%", value: 0.25 },
    { label: "50%", value: 0.5 },
    { label: "75%", value: 0.75 },
    { label: "100%", value: 1 },
    { label: "125%", value: 1.25 },
    { label: "150%", value: 1.5 },
    { label: "200%", value: 2 },
];
exports.QUALITY_OPTIONS = [
    {
        label: "Original",
        value: "original",
    },
    {
        label: "1080p",
        value: "1080",
    },
    {
        label: "720p",
        value: "720",
    },
    {
        label: "480p",
        value: "480",
    },
    {
        label: "360p",
        value: "360",
    },
];
//# sourceMappingURL=voices.js.map