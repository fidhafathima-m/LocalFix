export interface ITechnicianDashboardService {
    getDashboardOverview(technicianId: string): Promise<any>
    getTechnicianProfile(technicianId: string): Promise<any>
}