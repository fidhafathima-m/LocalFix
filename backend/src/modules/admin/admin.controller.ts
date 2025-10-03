import { Request, Response } from "express";
import User from "../user/user.model";

const VALID_STATUSES = ["Active", "Inactive", "Blocked"] as const;

// USER MANAGEMENT


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
  

// TECHNICIAN MANAGEMENT

// src/modules/technician/technician.controller.ts
import { Technician } from '../technician/schemas/TechnicianSchema';
import { TechnicianApplication } from '../technician/schemas/TechnicianApplicationSchema';
import { AuthRequest } from '../../middleware/authMiddleware';

// Get all technicians with filters
export const getAllTechnicians = async (req: Request, res: Response) => {
  try {
    const { 
      status, 
      service, 
      rating, 
      location,
      search,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter: any = {};

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Service filter
    if (service && service !== 'All Services') {
      filter.services = service;
    }

    // Rating filter
    if (rating && rating !== 'All Ratings') {
      const ratingMap: any = {
        '5 Star': { $gte: 4.8 },
        '4+ Star': { $gte: 4.0 },
        '3+ Star': { $gte: 3.0 }
      };
      filter.averageRating = ratingMap[rating as string];
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { displayName: searchRegex },
        { 'user.email': searchRegex },
        { 'user.phone': searchRegex },
        { workAreas: { $in: [searchRegex] } }
      ];
    }

    // Location filter
    if (location && location !== 'All Locations') {
      filter.workAreas = { $in: [new RegExp(location as string, 'i')] };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get technicians with user data populated
    const technicians = await Technician.find(filter)
      .populate('userId', 'email phone fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Format the response
    const formattedTechnicians = technicians.map((tech: { userId: any; }) => ({
      ...tech,
      user: tech.userId, // Map userId to user object
      email: (tech.userId as any)?.email,
      phone: (tech.userId as any)?.phone
    }));

    const total = await Technician.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        technicians: formattedTechnicians,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get technicians error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch technicians',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get technician by ID
export const getTechnicianById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const technician = await Technician.findById(id)
      .populate('userId', 'email phone fullName createdAt')
      .lean();

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // Get technician's application data
    const application = await TechnicianApplication.findOne({
      technicianId: technician.userId
    }).lean();

    res.status(200).json({
      success: true,
      data: {
        technician: {
          ...technician,
          user: technician.userId,
          application
        }
      }
    });

  } catch (error) {
    console.error('Get technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch technician',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update technician status
export const updateTechnicianStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['approved', 'suspended', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (approved, suspended, rejected)'
      });
    }

    const technician = await Technician.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId', 'email phone fullName');

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // If approving a technician, also update their application status
    if (status === 'approved') {
      await TechnicianApplication.findOneAndUpdate(
        { technicianId: technician.userId },
        { status: 'approved' }
      );
    }

    res.status(200).json({
      success: true,
      message: `Technician status updated to ${status}`,
      data: { technician }
    });

  } catch (error) {
    console.error('Update technician status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update technician status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get technician by application ID
export const getTechnicianByApplicationId = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;

    const application = await TechnicianApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const technician = await Technician.findOne({ 
      userId: application.technicianId 
    }).populate('userId', 'email phone fullName');

    res.status(200).json({
      success: true,
      data: { technician }
    });

  } catch (error) {
    console.error('Get technician by application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch technician',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get technician statistics
export const getTechnicianStats = async (req: Request, res: Response) => {
  try {
    const totalTechnicians = await Technician.countDocuments();
    const activeTechnicians = await Technician.countDocuments({ status: 'approved' });
    const pendingTechnicians = await Technician.countDocuments({ status: 'pending' });
    const suspendedTechnicians = await Technician.countDocuments({ status: 'suspended' });

    // Get recent technicians (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentTechnicians = await Technician.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalTechnicians,
        active: activeTechnicians,
        pending: pendingTechnicians,
        suspended: suspendedTechnicians,
        recent: recentTechnicians
      }
    });

  } catch (error) {
    console.error('Get technician stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch technician statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


// Get all pending applications
export const getPendingApplications = async (req: Request, res: Response) => {
  try {
    const { 
      status = 'submitted,under_review',
      search,
      service,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter: any = {
      status: { $in: (status as string).split(',') }
    };

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { 'personal.fullName': searchRegex },
        { email: searchRegex },
        { 'personal.phoneNumber': searchRegex }
      ];
    }

    // Service filter
    if (service && service !== 'All Services') {
      filter['skills.services'] = service;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const applications = await TechnicianApplication.find(filter)
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await TechnicianApplication.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get pending applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending applications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Approve technician application
export const approveApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;

    const application = await TechnicianApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update application status
    application.status = 'approved';
    application.reviewNotes = reviewNotes;
    application.submittedAt = new Date();
    await application.save();

    // Update user's application status
    await User.findByIdAndUpdate(application.technicianId, {
      applicationStatus: 'approved'
    });

    // Update or create technician record
    let technician = await Technician.findOne({ userId: application.technicianId });
    
    if (technician) {
      // Update existing technician
      technician.status = 'approved';
      technician.displayName = application.personal?.fullName || 'Technician';
      technician.bio = application.skills?.bio || '';
      technician.experienceYears = parseInt(application.skills?.yearsOfExperience) || 0;
      technician.services = application.skills?.services || [];
      technician.workAreas = application.skills?.serviceAreas || [];
      technician.serviceRadiusKm = parseInt(application.skills?.workRadius) || 10;
      await technician.save();
    } else {
      // Create new technician record
      technician = new Technician({
        userId: application.technicianId,
        displayName: application.personal?.fullName || 'Technician',
        bio: application.skills?.bio || '',
        experienceYears: parseInt(application.skills?.yearsOfExperience) || 0,
        services: application.skills?.services || [],
        serviceRates: {},
        workAreas: application.skills?.serviceAreas || [],
        serviceRadiusKm: parseInt(application.skills?.workRadius) || 10,
        currentLocation: {
          type: 'Point',
          coordinates: [0, 0] // Default coordinates
        },
        averageRating: 0,
        ratingCount: 0,
        status: 'approved',
        profilePictureUrl: application.documents?.passportPhoto?.url || '',
      });
      await technician.save();
    }

    res.status(200).json({
      success: true,
      message: 'Application approved successfully',
      data: { 
        application,
        technician 
      }
    });

  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve application',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Reject technician application
export const rejectApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const application = await TechnicianApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update application status
    application.status = 'rejected';
    application.rejectionReason = rejectionReason;
    await application.save();

    // Update user's application status
    await User.findByIdAndUpdate(application.technicianId, {
      applicationStatus: 'rejected'
    });

    // Update technician status if exists
    await Technician.findOneAndUpdate(
      { userId: application.technicianId },
      { status: 'rejected' }
    );

    res.status(200).json({
      success: true,
      message: 'Application rejected successfully',
      data: { application }
    });

  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject application',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get application by ID
export const getApplicationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const application = await TechnicianApplication.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get user data
    const user = await User.findById(application.technicianId)
      .select('email phone fullName createdAt')
      .lean();

    res.status(200).json({
      success: true,
      data: {
        application: {
          ...application.toObject(),
          user
        }
      }
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get application statistics
export const getApplicationStats = async (req: Request, res: Response) => {
  try {
    const totalApplications = await TechnicianApplication.countDocuments();
    const pendingApplications = await TechnicianApplication.countDocuments({
      status: { $in: ['submitted', 'under_review'] }
    });
    const approvedApplications = await TechnicianApplication.countDocuments({
      status: 'approved'
    });
    const rejectedApplications = await TechnicianApplication.countDocuments({
      status: 'rejected'
    });

    // Get applications from last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentApplications = await TechnicianApplication.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications,
        recent: recentApplications
      }
    });

  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};