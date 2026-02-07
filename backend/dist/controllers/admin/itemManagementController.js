"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemManagementController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
class ItemManagementController {
    constructor(itemService, logger) {
        this.createItem = async (req, res) => {
            const context = {
                operation: 'createItem',
                body: req.body,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Creating new item', context);
                const createDto = req.body;
                // Validation
                if (!createDto.name?.trim()) {
                    this._logger.warn('Item creation failed - name required', context);
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.ITEM_MESSAGES.NAME_REQUIRED);
                    res.status(response.statusCode).json(response);
                    return;
                }
                if (!createDto.description?.trim()) {
                    this._logger.warn('Item creation failed - description required', context);
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.ITEM_MESSAGES.DESCRIPTION_REQUIRED);
                    res.status(response.statusCode).json(response);
                    return;
                }
                if (!createDto.serviceId?.trim()) {
                    this._logger.warn('Item creation failed - service ID required', context);
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.ITEM_MESSAGES.SERVICE_ID_REQUIRED);
                    res.status(response.statusCode).json(response);
                    return;
                }
                if (createDto.price === undefined || createDto.price < 0) {
                    this._logger.warn('Item creation failed - invalid price', {
                        ...context,
                        providedPrice: createDto.price,
                    });
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.ITEM_MESSAGES.INVALID_PRICE);
                    res.status(response.statusCode).json(response);
                    return;
                }
                const item = await this._itemService.createItem(createDto);
                this._logger.info('Item created successfully', {
                    ...context,
                    itemId: item.id,
                    itemName: item.name,
                    serviceId: item.serviceId,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.ITEM_MESSAGES.ITEM_CREATED, {
                    item,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.ITEM_MESSAGES.FAILED_CREATE_ITEM;
                this._logger.error('Create item controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getItemById = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'getItemById',
                itemId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching item by ID', context);
                const item = await this._itemService.getItemById(id);
                this._logger.info('Item retrieved successfully', {
                    ...context,
                    itemName: item.name,
                    serviceId: item.serviceId,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.ITEM_MESSAGES.ITEM_RETRIEVED, {
                    item,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : constants_1.ITEM_MESSAGES.ITEM_NOT_FOUND;
                this._logger.error('Get item by ID controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getItemsByServiceId = async (req, res) => {
            const { serviceId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const context = {
                operation: 'getItemsByServiceId',
                serviceId,
                page,
                limit,
                search,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching items by service ID', context);
                const result = await this._itemService.getItemsByServiceId(serviceId, page, limit, search);
                this._logger.info('Items by service retrieved successfully', {
                    ...context,
                    totalItems: result.total,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.ITEM_MESSAGES.ITEMS_RETRIEVED, result);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.ITEM_MESSAGES.FAILED_FETCH_ITEMS;
                this._logger.error('Get items by service controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getAllItems = async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const context = {
                operation: 'getAllItems',
                page,
                limit,
                search,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching all items', context);
                const result = await this._itemService.getAllItems(page, limit, search);
                this._logger.info('All items retrieved successfully', {
                    ...context,
                    totalItems: result.total,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.ITEM_MESSAGES.ITEMS_RETRIEVED, result);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.ITEM_MESSAGES.FAILED_FETCH_ITEMS;
                this._logger.error('Get all items controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.updateItem = async (req, res) => {
            const { id } = req.params;
            const updateDto = req.body;
            const context = {
                operation: 'updateItem',
                itemId: id,
                updateFields: Object.keys(updateDto),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating item', context);
                const item = await this._itemService.updateItem(id, updateDto);
                this._logger.info('Item updated successfully', {
                    ...context,
                    itemName: item.name,
                    updatedFields: Object.keys(updateDto),
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.ITEM_MESSAGES.ITEM_UPDATED, {
                    item,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.ITEM_MESSAGES.FAILED_UPDATE_ITEM;
                this._logger.error('Update item controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.deleteItem = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'deleteItem',
                itemId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Deleting item', context);
                await this._itemService.deleteItem(id);
                this._logger.info('Item deleted successfully', context);
                const response = responseHelper_1.ResponseHelper.success(constants_1.ITEM_MESSAGES.ITEM_DELETED);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.ITEM_MESSAGES.FAILED_DELETE_ITEM;
                this._logger.error('Delete item controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.searchItems = async (req, res) => {
            const { q } = req.query;
            const limit = parseInt(req.query.limit) || 10;
            const context = {
                operation: 'searchItems',
                query: q,
                limit,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Searching items', context);
                if (!q || typeof q !== 'string') {
                    this._logger.warn('Search items failed - query required', context);
                    const response = responseHelper_1.ResponseHelper.badRequest('Search query is required');
                    res.status(response.statusCode).json(response);
                    return;
                }
                const items = await this._itemService.searchItems(q, limit);
                this._logger.info('Items search completed successfully', {
                    ...context,
                    resultsCount: items.length,
                });
                const response = responseHelper_1.ResponseHelper.success('Items search completed', {
                    items,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                this._logger.error('Search items controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error('Failed to search items');
                res.status(response.statusCode).json(response);
            }
        };
        this._itemService = itemService;
        this._logger = logger;
    }
}
exports.ItemManagementController = ItemManagementController;
