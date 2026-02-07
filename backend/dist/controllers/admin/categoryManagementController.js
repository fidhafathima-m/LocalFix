"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryManagementController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
class CategoryManagementController {
    constructor(categoryService, logger) {
        this.createCategory = async (req, res) => {
            const context = {
                operation: 'createCategory',
                body: req.body,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Creating new category', context);
                const createDto = req.body;
                // Validation
                if (!createDto.name?.trim()) {
                    this._logger.warn('Category creation failed - name required', context);
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.CATEGORY_MESSAGES.NAME_REQUIRED);
                    res.status(response.statusCode).json(response);
                    return;
                }
                if (!createDto.description?.trim()) {
                    this._logger.warn('Category creation failed - description required', context);
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.CATEGORY_MESSAGES.DESCRIPTION_REQUIRED);
                    res.status(response.statusCode).json(response);
                    return;
                }
                const category = await this._categoryService.createCategory(createDto);
                this._logger.info('Category created successfully', {
                    ...context,
                    categoryId: category.id,
                    categoryName: category.name,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.CATEGORY_MESSAGES.CATEGORY_CREATED, { category });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.CATEGORY_MESSAGES.FAILED_CREATE_CATEGORY;
                this._logger.error('Create category controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = {
                    success: false,
                    message: errorMessage,
                    error: errorMessage,
                    statusCode: 400,
                };
                res.status(response.statusCode).json(response);
            }
        };
        this.getCategoryById = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'getCategoryById',
                categoryId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching category by ID', context);
                const category = await this._categoryService.getCategoryById(id);
                this._logger.info('Category retrieved successfully', {
                    ...context,
                    categoryName: category.name,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.CATEGORY_MESSAGES.CATEGORY_RETRIEVED, { category });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.CATEGORY_MESSAGES.CATEGORY_NOT_FOUND;
                this._logger.error('Get category by ID controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getCategoryBySlug = async (req, res) => {
            const { slug } = req.params;
            const context = {
                operation: 'getCategoryBySlug',
                slug,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching category by slug', context);
                const category = await this._categoryService.getCategoryBySlug(slug);
                this._logger.info('Category retrieved by slug successfully', {
                    ...context,
                    categoryId: category.id,
                    categoryName: category.name,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.CATEGORY_MESSAGES.CATEGORY_RETRIEVED, { category });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.CATEGORY_MESSAGES.CATEGORY_NOT_FOUND;
                this._logger.error('Get category by slug controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getAllCategories = async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const status = req.query.status;
            const context = {
                operation: 'getAllCategories',
                page,
                limit,
                search,
                status,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching all categories with filters', context);
                const result = await this._categoryService.getAllCategories(page, limit, search, status);
                this._logger.info('Categories retrieved successfully with filters', {
                    ...context,
                    totalCategories: result.total,
                    appliedFilters: {
                        search: !!search,
                        status: status && status !== 'All Status' ? status : 'none',
                    },
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.CATEGORY_MESSAGES.CATEGORIES_RETRIEVED, result);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.CATEGORY_MESSAGES.FAILED_FETCH_CATEGORIES;
                this._logger.error('Get all categories with filters controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.updateCategory = async (req, res) => {
            const { id } = req.params;
            const updateDto = req.body;
            const context = {
                operation: 'updateCategory',
                categoryId: id,
                updateFields: Object.keys(updateDto),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating category', context);
                const category = await this._categoryService.updateCategory(id, updateDto);
                this._logger.info('Category updated successfully', {
                    ...context,
                    categoryName: category.name,
                    updatedFields: Object.keys(updateDto),
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.CATEGORY_MESSAGES.CATEGORY_UPDATED, { category });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.CATEGORY_MESSAGES.FAILED_UPDATE_CATEGORY;
                this._logger.error('Update category controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.deleteCategory = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'deleteCategory',
                categoryId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Deleting category', context);
                await this._categoryService.deleteCategory(id);
                this._logger.info('Category deleted successfully', context);
                const response = responseHelper_1.ResponseHelper.success(constants_1.CATEGORY_MESSAGES.CATEGORY_DELETED);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.CATEGORY_MESSAGES.FAILED_DELETE_CATEGORY;
                this._logger.error('Delete category controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.searchCategories = async (req, res) => {
            const { q } = req.query;
            const limit = parseInt(req.query.limit) || 10;
            const context = {
                operation: 'searchCategories',
                query: q,
                limit,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Searching categories', context);
                if (!q || typeof q !== 'string') {
                    this._logger.warn('Search categories failed - query required', context);
                    const response = responseHelper_1.ResponseHelper.badRequest('Search query is required');
                    res.status(response.statusCode).json(response);
                    return;
                }
                const categories = await this._categoryService.searchCategories(q, limit);
                this._logger.info('Categories search completed successfully', {
                    ...context,
                    resultsCount: categories.length,
                });
                const response = responseHelper_1.ResponseHelper.success('Categories search completed', {
                    categories,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                this._logger.error('Search categories controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error('Failed to search categories');
                res.status(response.statusCode).json(response);
            }
        };
        this._categoryService = categoryService;
        this._logger = logger;
    }
}
exports.CategoryManagementController = CategoryManagementController;
