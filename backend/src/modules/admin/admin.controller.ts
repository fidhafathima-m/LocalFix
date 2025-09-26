import { Request, Response } from "express";
import User from "../user/user.model";

const VALID_STATUSES = ["Active", "Inactive", "Blocked"] as const;

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.aggregate([
      { $match: { role: "user", isDeleted: { $ne: true } } },
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

    // Return users array directly, not wrapped in a 'users' property
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
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
    if (updatedUser.isDeleted) {
      return res.status(400).json({ message: "Cannot update a deleted user" });
    }

    res.json({ message: "User status updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({
      message: "Error updating user status",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const editUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { fullName, email, phone, status } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (status) updateData.status = status;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-passwordHash'); // Exclude password hash

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (updatedUser.isDeleted) {
      return res.status(400).json({ message: "Cannot update a deleted user" });
    }

    // Return the user object directly, not wrapped in a 'user' property
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      message: "Error updating user",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isDeleted = true;
    await user.save();

    res.json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};
  