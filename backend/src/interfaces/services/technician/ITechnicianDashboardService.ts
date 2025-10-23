import { ITechnician } from "@/interfaces/technician/ITechnician"

export interface ITechnicianDashboardService {
    getDashboardOverview(technicianId: string): Promise<ITechnician>
    getTechnicianProfile(technicianId: string): Promise<ITechnician>
}