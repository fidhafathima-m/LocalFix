import { Request, Response } from "express";
import User from "../../models/UserSchema";

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({role: "user"}).sort({ createdAt: -1 });
    res.json({users});
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};
