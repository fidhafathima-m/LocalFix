"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    handleError(operation, error) {
        // Check if it's a MongoDB connection error
        if (error.name === "MongooseError" &&
            error.message.includes("buffering timed out")) {
            throw new Error(`Database connection timeout during ${operation}: ${error.message}`);
        }
        // Check if it's a connection error
        if (error.name === "MongoNetworkError" ||
            error.name === "MongoTimeoutError") {
            throw new Error(`Database connection failed during ${operation}: ${error.message}`);
        }
        throw new Error(`Failed to ${operation} ${this.model.modelName}: ${error.message}`);
    }
    async create(data) {
        try {
            const created = new this.model(data);
            return await created.save();
        }
        catch (error) {
            this.handleError("create", error);
        }
    }
    async findById(id) {
        try {
            return await this.model.findById(id).exec();
        }
        catch (error) {
            this.handleError("find by ID", error);
        }
    }
    async findOne(filter) {
        try {
            return await this.model.findOne(filter).exec();
        }
        catch (error) {
            this.handleError("find one", error);
        }
    }
    async find(filter = {}) {
        try {
            return await this.model.find(filter).exec();
        }
        catch (error) {
            this.handleError("find", error);
        }
    }
    async update(id, data) {
        try {
            return await this.model
                .findByIdAndUpdate(id, data, {
                new: true,
            })
                .exec();
        }
        catch (error) {
            this.handleError("update", error);
        }
    }
    async delete(id) {
        try {
            const result = await this.model.findByIdAndDelete(id).exec();
            return result !== null;
        }
        catch (error) {
            this.handleError("delete", error);
        }
    }
    async count(filter = {}) {
        try {
            return await this.model.countDocuments(filter).exec();
        }
        catch (error) {
            this.handleError("count", error);
        }
    }
    async exists(filter) {
        try {
            const count = await this.model.countDocuments(filter).exec();
            return count > 0;
        }
        catch (error) {
            this.handleError("check existence", error);
        }
    }
    async save(entity) {
        try {
            return await entity.save();
        }
        catch (error) {
            this.handleError("save", error);
        }
    }
}
exports.BaseRepository = BaseRepository;
