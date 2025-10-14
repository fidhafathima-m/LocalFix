import { Technician } from "../../models/technician/TechnicianSchema";
import {
  TechnicianApplication,
  ITechnicianApplication,
} from "../../models/technician/TechnicianApplicationSchema";
import User from "../../models/UserSchema";
import UserAddressSchema from "../../models/UserAddressSchema";
import { Types } from "mongoose";
import { ITechnician } from "@/interfaces/admin/ITechnicianManagement";

export class TechnicianManagementRepository {
  async findAllTechnicians(
    filter: any,
    skip: number,
    limit: number
  ): Promise<ITechnician[]> {
    return await Technician.find(filter)
      .populate("userId", "email phone fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countTechnicians(filter: any): Promise<number> {
    return await Technician.countDocuments(filter);
  }

  async findTechnicianById(id: string): Promise<ITechnician | null> {
    return await Technician.findById(id)
      .populate("userId", "email phone fullName createdAt")
      .lean();
  }

  async updateTechnicianStatus(
  id: string, 
  status: string, 
  additionalData?: any
): Promise<ITechnician | null> {
  try {
    const updateData: any = { status };
    
    // Merge additional data if provided
    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    const technician = await Technician.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!technician) {
      return null;
    }

    return technician;
  } catch (error) {
    console.error("Repository: Error updating technician status:", error);
    throw error;
  }
}

  async updateTechnicianPersonalInfo(
    technicianId: string,
    personalInfo: any
  ): Promise<ITechnician | null> {
    return await Technician.findByIdAndUpdate(
      technicianId,
      {
        $set: {
          personalInfo,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );
  }

  async findTechnicianByUserId(userId: string): Promise<ITechnician | null> {
    try {
      return await Technician.findOne({ userId: new Types.ObjectId(userId) });
    } catch (error) {
      console.error("Error finding technician by userId:", error);
      return null;
    }
  }

  async getTechnicianStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    recent: number;
  }> {
    const total = await Technician.countDocuments();
    const active = await Technician.countDocuments({ status: "approved" });
    const pending = await Technician.countDocuments({ status: "pending" });
    const suspended = await Technician.countDocuments({ status: "suspended" });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recent = await Technician.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    return { total, active, pending, suspended, recent };
  }

  async findAllApplications(
    filter: any,
    skip: number,
    limit: number
  ): Promise<ITechnicianApplication[]> {
    return await TechnicianApplication.find(filter)
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countApplications(filter: any): Promise<number> {
    return await TechnicianApplication.countDocuments(filter);
  }

  async findApplicationById(
    id: string
  ): Promise<ITechnicianApplication | null> {
    return await TechnicianApplication.findById(id);
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string,
    additionalData?: any
  ): Promise<ITechnicianApplication | null> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (additionalData) {
        if (additionalData.rejectionReason) {
          updateData.rejectionReason = additionalData.rejectionReason;
        }
        if (additionalData.rejectedAt) {
          updateData.rejectedAt = additionalData.rejectedAt;
        } else if (status === "rejected") {
          updateData.rejectedAt = new Date();
        }
        if (additionalData.reviewNotes) {
          updateData.reviewNotes = additionalData.reviewNotes;
        }
      }

      const result = await TechnicianApplication.findByIdAndUpdate(
        applicationId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return result;
    } catch (error) {
      console.error("Error in updateApplicationStatus:", error);
      throw error;
    }
  }
  async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recent: number;
  }> {
    const total = await TechnicianApplication.countDocuments();
    const pending = await TechnicianApplication.countDocuments({
      status: { $in: ["submitted", "under_review"] },
    });
    const approved = await TechnicianApplication.countDocuments({
      status: "approved",
    });
    const rejected = await TechnicianApplication.countDocuments({
      status: "rejected",
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recent = await TechnicianApplication.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    return { total, pending, approved, rejected, recent };
  }

  async updateUserApplicationStatus(
    userId: Types.ObjectId,
    applicationStatus: string
  ): Promise<any> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { applicationStatus } },
      { new: true }
    );
  }

  async findUserAddress(userId: Types.ObjectId): Promise<any> {
    try {
      const address = await UserAddressSchema.findOne({
        userId,
        isDefault: true,
      })
        .select("street city state pincode landmark")
        .lean();

      return address;
    } catch (error) {
      console.error("Error finding user address:", error);
      return null;
    }
  }

  async findOrCreateTechnician(application: any): Promise<ITechnician> {
    try {
      let technician = await Technician.findOne({
        userId: application.technicianId,
      });

      const languages = application.personal?.languages || [];
      const languagesArray = Array.isArray(languages)
        ? languages
        : typeof languages === "string"
        ? [languages]
        : [];

      if (technician) {
        technician = await Technician.findOneAndUpdate(
          { userId: application.technicianId },
          {
            $set: {
              displayName:
                application.personal?.fullName || technician.displayName,
              services: application.skills?.services || technician.services,
              experienceYears:
                application.skills?.yearsOfExperience ||
                technician.experienceYears,
              workAreas:
                application.availability?.serviceAreas || technician.workAreas,
              serviceRadiusKm: application.availability?.workRadius
                ? parseInt(application.availability.workRadius)
                : technician.serviceRadiusKm,
              status: "approved",
              profilePictureUrl:
                application.documents?.passportPhoto?.url ||
                application.documents?.profilePhoto?.url ||
                technician.profilePictureUrl,
              phone: application.personal?.phoneNumber || technician.phone,
              personalInfo: {
                fullName:
                  application.personal?.fullName ||
                  technician.personalInfo?.fullName,
                gender:
                  application.personal?.gender ||
                  technician.personalInfo?.gender,
                phoneNumber:
                  application.personal?.phoneNumber ||
                  technician.personalInfo?.phoneNumber,
                dateOfBirth:
                  application.personal?.dateOfBirth ||
                  technician.personalInfo?.dateOfBirth,
                address:
                  application.personal?.address ||
                  technician.personalInfo?.address,
                languages: languagesArray,
              },
            },
          },
          { new: true }
        );
      } else {
        technician = await Technician.create({
          userId: application.technicianId,
          displayName: application.personal?.fullName || "Technician",
          services: application.skills?.services || [],
          experienceYears: application.skills?.yearsOfExperience || 0,
          workAreas: application.availability?.serviceAreas || [],
          serviceRadiusKm: application.availability?.workRadius
            ? parseInt(application.availability.workRadius)
            : 10,
          status: "approved",
          profilePictureUrl:
            application.documents?.passportPhoto?.url ||
            application.documents?.profilePhoto?.url,
          phone: application.personal?.phoneNumber,
          personalInfo: {
            fullName: application.personal?.fullName,
            gender: application.personal?.gender,
            phoneNumber: application.personal?.phoneNumber,
            dateOfBirth: application.personal?.dateOfBirth,
            address: application.personal?.address,
            languages: languagesArray,
          },
        });
      }

      if (!technician) {
        throw new Error("Technician could not be found or created");
      }

      return technician;
    } catch (error) {
      console.error("Find or create technician error:", error);
      throw error;
    }
  }
  async findTechnicianByApplicationId(
    applicationId: string
  ): Promise<ITechnician | null> {
    const application = await TechnicianApplication.findById(applicationId);
    if (!application) return null;

    return await Technician.findOne({
      userId: application.technicianId,
    }).populate("userId", "email phone fullName");
  }

  async findUserById(userId: Types.ObjectId): Promise<any> {
    try {
      const user = await User.findById(userId)
        .select("email phone fullName createdAt")
        .lean();

      return user;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  }

  async findApplicationByTechnicianId(technicianId: string): Promise<any> {
    try {
      const application = await TechnicianApplication.findOne({
        technicianId: new Types.ObjectId(technicianId),
      })
        .select("personal skills documents status")
        .lean();

      if (!application) {
        const technician = await Technician.findById(technicianId);
        if (technician) {
          const appByUserId = await TechnicianApplication.findOne({
            technicianId: technician.userId,
          })
            .select("personal skills documents status")
            .lean();

          return appByUserId;
        }
      }

      return application;
    } catch (error) {
      console.error("Error finding application by technician ID:", error);
      return null;
    }
  }
}
