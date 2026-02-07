"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const redis_1 = require("redis");
class RedisService {
    constructor() {
        this.isConnected = false;
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        this.client = (0, redis_1.createClient)({
            url: redisUrl,
            socket: {
                reconnectStrategy: retries => Math.min(retries * 50, 1000),
            },
        });
        this.client.on('error', err => {
            console.error('Redis Client Error:', err);
            this.isConnected = false;
        });
        this.client.on('connect', () => {
            console.log('Redis Client Connected');
            this.isConnected = true;
        });
    }
    async connect() {
        if (!this.isConnected) {
            await this.client.connect();
        }
    }
    async get(key) {
        try {
            await this.ensureConnection();
            return (await this.client.get(key));
        }
        catch (error) {
            console.error('Redis GET error:', error);
            return null;
        }
    }
    async setex(key, seconds, value) {
        try {
            await this.ensureConnection();
            await this.client.setEx(key, seconds, value);
        }
        catch (error) {
            console.error('Redis SETEX error:', error);
        }
    }
    async del(key) {
        try {
            await this.ensureConnection();
            await this.client.del(key);
        }
        catch (error) {
            console.error('Redis DEL error:', error);
        }
    }
    async ensureConnection() {
        if (!this.isConnected) {
            await this.connect();
        }
    }
    async disconnect() {
        if (this.isConnected) {
            await this.client.disconnect();
            this.isConnected = false;
        }
    }
}
exports.RedisService = RedisService;
