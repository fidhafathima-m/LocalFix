import { IUser, IUserCreate, IUserUpdate } from "../../../interfaces/user/IUser";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findByPhone(phone: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findByIdentifier(identifier: string, role?: string): Promise<IUser | null>;
  create(userData: IUserCreate): Promise<IUser>;
  update(id: string, updateData: IUserUpdate): Promise<IUser | null>;
  updatePassword(
    identifier: string,
    passwordHash: string,
    userType?: string
  ): Promise<IUser | null>;
  updateApplicationStatus(
    userId: string,
    applicationStatus: string
  ): Promise<IUser | null>;
  updateRole(userId: string, role: string): Promise<IUser | null>;
  findOne(query: any): Promise<IUser | null>;
}
