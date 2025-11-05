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

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ServicesResponse {
  services: Service[];
  pagination: PaginationInfo;
}

// Service to fetch services from backend with pagination
export const fetchServices = async (
  page: number = 1,
  pageSize: number = 10,
  search?: string
): Promise<ServicesResponse> => {
  try {
    const response = await ServiceManagementService.getAllServices(page, pageSize, search);

    // Transform the API response to match your frontend needs
    if (response && response.services) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const services = response.services.map((service: any) => ({
        id: service.id,
        categoryId: service.categoryId,
        name: service.name,
        description: service.description,
        iconUrl: service.iconUrl || getDefaultIcon(service.name),
        slug: service.slug,
        status: service.status,
        itemCount: service.itemCount,
        rating: service.rating,
        estimatedDuration: service.estimatedDuration,
        features: service.features,
        popular: service.popular,
        avgBasePrice: service.avgBasePrice,
      }));

      // Extract pagination info from response
      const pagination: PaginationInfo = {
        currentPage: page,
        pageSize: pageSize,
        totalItems: response.totalItems || response.total || 0,
        totalPages: response.totalPages || Math.ceil((response.totalItems || response.total || 0) / pageSize),
        hasNext: response.hasNext !== undefined ? response.hasNext : page < (response.totalPages || Math.ceil((response.totalItems || response.total || 0) / pageSize)),
        hasPrevious: response.hasPrevious !== undefined ? response.hasPrevious : page > 1,
      };

      return {
        services,
        pagination,
      };
    }

    return {
      services: [],
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    };
  } catch (error) {
    console.error("Error fetching services:", error);
    return {
      services: [],
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    };
  }
};

// Keep backward compatibility
export const fetchServicesWithoutPagination = async (): Promise<Service[]> => {
  const response = await fetchServices(1, 1000);
  return response.services;
};

// Helper function for default icons
const getDefaultIcon = (serviceName: string): string => {
  const iconMap: { [key: string]: string } = {
    "AC Repair & Service": "/icons/ac.svg",
    "Washing Machine": "/icons/washing-machine.svg",
    Refrigerator: "/icons/refrigerator.svg",
    "Fan Repair": "/icons/fan.svg",
    "TV Repair": "/icons/tv.svg",
    Microwave: "/icons/microwave.svg",
  };

  return iconMap[serviceName] || "/icons/default-service.svg";
};

export default fetchServices;