import { FilterQuery, Types } from "mongoose";
import {
  IItem,
  IItemCreate,
  IItemUpdate,
} from "../../interfaces/admin/IItemManagement";
import { IItemRepository } from "../../interfaces/repository/admin/IItemRepository";
import { Item } from "../../models/category/itemSchema";

export class ItemRepository implements IItemRepository {
  async create(itemData: IItemCreate): Promise<IItem> {
    if (!itemData.sku) {
      itemData.sku = this.generateSKU(itemData.name);
    }

    const item = new Item(itemData);
    return await item.save();
  }

  async findById(itemId: string | Types.ObjectId): Promise<IItem | null> {
    return await Item.findById(itemId);
  }

  async findBySku(sku: string): Promise<IItem | null> {
    return await Item.findOne({ sku: sku.toUpperCase() });
  }

  async findByName(name: string): Promise<IItem | null> {
    return await Item.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
  }

  async findByServiceId(serviceId: string | Types.ObjectId): Promise<IItem[]> {
    return await Item.find({ serviceId }).sort({ createdAt: -1 });
  }

  async findAll(
    filter: FilterQuery<IItem> = {},
    skip: number = 0,
    limit: number = 10
  ): Promise<IItem[]> {
    return await Item.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async update(
    itemId: string | Types.ObjectId,
    updateData: IItemUpdate
  ): Promise<IItem | null> {
    return await Item.findByIdAndUpdate(
      itemId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async delete(itemId: string | Types.ObjectId): Promise<boolean> {
    const result = await Item.findByIdAndDelete(itemId);
    return result !== null;
  }

  async count(filter: FilterQuery<IItem> = {}): Promise<number> {
    return await Item.countDocuments(filter);
  }

  async search(query: string, limit: number = 10): Promise<IItem[]> {
    return await Item.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { sku: { $regex: query, $options: "i" } },
      ],
    })
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async searchByService(
    serviceId: string | Types.ObjectId,
    query: string,
    limit: number = 10
  ): Promise<IItem[]> {
    return await Item.find({
      serviceId,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { sku: { $regex: query, $options: "i" } },
      ],
    })
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  private generateSKU(name: string): string {
    const prefix = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}
