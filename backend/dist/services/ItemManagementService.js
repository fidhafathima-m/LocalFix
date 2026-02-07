"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemService = void 0;
const constants_1 = require("../constants");
const mongoose_1 = require("mongoose");
const itemMapper_1 = require("../mappers/itemMapper");
class ItemService {
    constructor(itemRepository, logger) {
        this._itemRepository = itemRepository;
        this._logger = logger;
    }
    async createItem(createDto) {
        const context = {
            operation: 'createItem',
            itemName: createDto.name,
            serviceId: createDto.serviceId,
            price: createDto.price,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Creating new item', context);
            // Check if item with same name already exists for this service
            const existingItem = await this._itemRepository.findByName(createDto.name);
            if (existingItem) {
                this._logger.warn('Item creation failed - item already exists', {
                    ...context,
                    existingItemId: existingItem._id.toString(),
                });
                throw new Error(constants_1.ITEM_MESSAGES.ITEM_ALREADY_EXISTS);
            }
            // Validate service ID
            if (!mongoose_1.Types.ObjectId.isValid(createDto.serviceId)) {
                this._logger.warn('Item creation failed - invalid service ID', context);
                throw new Error(constants_1.ITEM_MESSAGES.INVALID_SERVICE_ID);
            }
            this._logger.debug('Creating item in repository', context);
            const item = await this._itemRepository.create({
                ...createDto,
                serviceId: new mongoose_1.Types.ObjectId(createDto.serviceId),
                isActive: createDto.isActive ?? true,
            });
            this._logger.info('Item created successfully', {
                ...context,
                itemId: item._id.toString(),
                serviceId: item.serviceId.toString(),
            });
            return (0, itemMapper_1.toItemResponseDto)(item);
        }
        catch (error) {
            this._logger.error('Create item error', {
                ...context,
                error: error instanceof Error ? error.message : 'Error in item creation',
                stack: error instanceof Error ? error.stack : 'Error stack',
            });
            throw error;
        }
    }
    async getItemById(itemId) {
        const context = {
            operation: 'getItemById',
            itemId,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching item by ID', context);
            const item = await this._itemRepository.findById(itemId);
            if (!item) {
                this._logger.warn('Item not found', context);
                throw new Error(constants_1.ITEM_MESSAGES.ITEM_NOT_FOUND);
            }
            this._logger.info('Item retrieved successfully', {
                ...context,
                itemName: item.name,
                serviceId: item.serviceId.toString(),
            });
            return (0, itemMapper_1.toItemResponseDto)(item);
        }
        catch (error) {
            this._logger.error('Get item by ID error', {
                ...context,
                error: error instanceof Error ? error.message : 'Error in getting item',
            });
            throw error;
        }
    }
    async getItemsByServiceId(serviceId, page = 1, limit = 10, search) {
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
            if (!mongoose_1.Types.ObjectId.isValid(serviceId)) {
                this._logger.warn('Invalid service ID provided', context);
                throw new Error(constants_1.ITEM_MESSAGES.INVALID_SERVICE_ID);
            }
            const skip = (page - 1) * limit;
            let items;
            let total;
            if (search) {
                this._logger.debug('Searching items by service with query', {
                    ...context,
                    searchQuery: search,
                });
                items = await this._itemRepository.searchByService(serviceId, search, limit);
                total = items.length;
            }
            else {
                this._logger.debug('Fetching all items by service', context);
                items = await this._itemRepository.findAll({ serviceId }, skip, limit);
                total = await this._itemRepository.count({ serviceId });
            }
            this._logger.info('Items by service retrieved successfully', {
                ...context,
                itemsCount: items.length,
                totalItems: total,
                hasSearch: !!search,
            });
            return (0, itemMapper_1.toItemListResponseDto)(items, total, page, limit);
        }
        catch (error) {
            this._logger.error('Get items by service error', {
                ...context,
                error: error instanceof Error
                    ? error.message
                    : 'Error in getting item by service',
            });
            throw error;
        }
    }
    async getAllItems(page = 1, limit = 10, search) {
        const context = {
            operation: 'getAllItems',
            page,
            limit,
            search,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching all items', context);
            const skip = (page - 1) * limit;
            let items;
            let total;
            if (search) {
                this._logger.debug('Searching items with query', {
                    ...context,
                    searchQuery: search,
                });
                items = await this._itemRepository.search(search, limit);
                total = items.length;
            }
            else {
                this._logger.debug('Fetching all items without search', context);
                items = await this._itemRepository.findAll({}, skip, limit);
                total = await this._itemRepository.count();
            }
            this._logger.info('All items retrieved successfully', {
                ...context,
                itemsCount: items.length,
                totalItems: total,
                hasSearch: !!search,
            });
            return (0, itemMapper_1.toItemListResponseDto)(items, total, page, limit);
        }
        catch (error) {
            this._logger.error('Get all items error', {
                ...context,
                error: error instanceof Error ? error.message : 'Error in getting all items',
            });
            throw error;
        }
    }
    async updateItem(itemId, updateDto) {
        const context = {
            operation: 'updateItem',
            itemId,
            updateFields: Object.keys(updateDto),
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Updating item', context);
            // Check if item exists
            const existingItem = await this._itemRepository.findById(itemId);
            if (!existingItem) {
                this._logger.warn('Update failed - item not found', context);
                throw new Error(constants_1.ITEM_MESSAGES.ITEM_NOT_FOUND);
            }
            // If name is being updated, check for duplicates
            if (updateDto.name && updateDto.name !== existingItem.name) {
                this._logger.debug('Checking for duplicate item name', {
                    ...context,
                    newName: updateDto.name,
                    oldName: existingItem.name,
                });
                const duplicateItem = await this._itemRepository.findByName(updateDto.name);
                if (duplicateItem && duplicateItem._id.toString() !== itemId) {
                    this._logger.warn('Update failed - item name already exists', {
                        ...context,
                        duplicateItemId: duplicateItem._id.toString(),
                    });
                    throw new Error(constants_1.ITEM_MESSAGES.ITEM_ALREADY_EXISTS);
                }
            }
            this._logger.debug('Updating item in repository', {
                ...context,
                updateData: updateDto,
            });
            const updatedItem = await this._itemRepository.update(itemId, updateDto);
            if (!updatedItem) {
                this._logger.error('Update failed - repository returned null', context);
                throw new Error(constants_1.ITEM_MESSAGES.FAILED_UPDATE_ITEM);
            }
            this._logger.info('Item updated successfully', {
                ...context,
                itemName: updatedItem.name,
                updatedFieldCount: Object.keys(updateDto).length,
            });
            return (0, itemMapper_1.toItemResponseDto)(updatedItem);
        }
        catch (error) {
            this._logger.error('Update item error', {
                ...context,
                error: error instanceof Error ? error.message : 'Error in updating item',
            });
            throw error;
        }
    }
    async deleteItem(itemId) {
        const context = {
            operation: 'deleteItem',
            itemId,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Deleting item', context);
            // Check if item exists
            const existingItem = await this._itemRepository.findById(itemId);
            if (!existingItem) {
                this._logger.warn('Delete failed - item not found', context);
                throw new Error(constants_1.ITEM_MESSAGES.ITEM_NOT_FOUND);
            }
            this._logger.debug('Deleting item from repository', {
                ...context,
                itemName: existingItem.name,
            });
            const deleted = await this._itemRepository.delete(itemId);
            if (!deleted) {
                this._logger.error('Delete failed - repository returned false', context);
                throw new Error(constants_1.ITEM_MESSAGES.FAILED_DELETE_ITEM);
            }
            this._logger.info('Item deleted successfully', context);
        }
        catch (error) {
            this._logger.error('Delete item error', {
                ...context,
                error: error instanceof Error ? error.message : 'Error in deleting item',
            });
            throw error;
        }
    }
    async searchItems(query, limit = 10) {
        const context = {
            operation: 'searchItems',
            query,
            limit,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Searching items', context);
            const items = await this._itemRepository.search(query, limit);
            this._logger.info('Item search completed', {
                ...context,
                resultsCount: items.length,
            });
            return items.map(item => (0, itemMapper_1.toItemResponseDto)(item));
        }
        catch (error) {
            this._logger.error('Search items error', {
                ...context,
                error: error instanceof Error ? error.message : 'Error in searching items',
            });
            throw error;
        }
    }
}
exports.ItemService = ItemService;
