// data/services.ts
import { ServiceManagementService } from "../../../services/admin/ServiceManagementService";

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  iconUrl: string;
  slug: string;
  status: string;
  itemCount?: number;
  popular?: boolean;
  rating?: number;
  estimatedDuration?: string;
  features?: string[];
  avgBasePrice?: number;
}

// Service to fetch services from backend
export const fetchServices = async (): Promise<Service[]> => {
  try {
    console.log("🔄 Fetching services from backend...");
    
    const response = await ServiceManagementService.getAllServices(1, 12);
    
    console.log("📡 Services API response:", response);
    
    // Transform the API response to match your frontend needs
    if (response && response.services) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return response.services.map((service: any) => ({
        id: service.id,
        categoryId: service.categoryId,
        name: service.name,
        description: service.description,
        iconUrl: service.iconUrl || getDefaultIcon(service.name),
        slug: service.slug,
        status: service.status,
        itemCount: service.itemCount,
        // ADD THE NEW FIELDS HERE
        rating: service.rating,
        estimatedDuration: service.estimatedDuration,
        features: service.features,
        popular: service.popular,
        avgBasePrice: service.avgBasePrice,
      }));
    }
    
    return [];
  } catch (error) {
    console.error("💥 Error fetching services:", error);
    return [];
  }
};

// Helper function for default icons
const getDefaultIcon = (serviceName: string): string => {
  const iconMap: { [key: string]: string } = {
    'AC Repair & Service': '/icons/ac.svg',
    'Washing Machine': '/icons/washing-machine.svg',
    'Refrigerator': '/icons/refrigerator.svg',
    'Fan Repair': '/icons/fan.svg',
    'TV Repair': '/icons/tv.svg',
    'Microwave': '/icons/microwave.svg',
  };
  
  return iconMap[serviceName] || '/icons/default-service.svg';
};

export default fetchServices;