"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// jest.config.js
exports.default = {
    preset: "ts-jest",
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    globals: {
        "ts-jest": {
            useESM: true,
        },
    },
};
