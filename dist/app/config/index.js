"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
    jwt_access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    jwt_access_token_expires_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    jwt_refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    jwt_refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    frontend_base_url: process.env.FRONTEND_BASE_URL,
    backend_base_url: process.env.BACKEND_BASE_URL,
    digitalocean: {
        spaces_endpoint: process.env.DO_SPACES_ENDPOINT,
        spaces_bucket: process.env.DO_SPACES_BUCKET,
        spaces_access_key: process.env.DO_SPACES_ACCESS_KEY,
        spaces_secret_key: process.env.DO_SPACES_SECRET_KEY,
        spaces_region: process.env.DO_SPACES_REGION,
    },
    emailSender: {
        email: process.env.EMAIL_SENDER,
        app_pass: process.env.EMAIL_SENDER_PASS,
    },
};
