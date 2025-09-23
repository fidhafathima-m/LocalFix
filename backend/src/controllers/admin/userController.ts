import { Request, Response } from "express";
import User from "../../models/UserSchema";
import mongoose from "mongoose";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.aggregate([
      { $match: { role: "user", isDeleted: {$ne: true} } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "useraddresses", 
          localField: "_id",
          foreignField: "userId",
          as: "addresses",
        },
      },
      {
        $addFields: {
          defaultAddress: {
            $first: {
              $filter: {
                input: "$addresses",
                as: "addr",
                cond: { $eq: ["$$addr.isDefault", true] },
              },
            },
          },
        },
      },
      { $project: { addresses: 0 } }, 
    ]);

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; 
    console.log(userId, status)

    if (!["Active", "Inactive", "Blocked"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User status updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating user status", error });
  }
};

export const editUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { fullName, email, phone, status } = req.body;

    // Validate status
    if (!["Active", "Inactive", "Blocked"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, email, phone, status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.isDeleted = true
    await user.save()

    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
}