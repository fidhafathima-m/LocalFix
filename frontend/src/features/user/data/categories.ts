// data/categories.ts
import { CategoryManagementService } from "../../../services/admin/CategoryManagementService";

export interface Category {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  slug: string;
  status: string;
  serviceCount?: number;
  createdAt: string;
}

// Service to fetch categories from backend
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    console.log("🔄 Fetching categories from backend...");
    
    const response = await CategoryManagementService.getCategories(1, 50);
    
    console.log("📡 Categories API response:", response);
    
    // Transform the API response to match your frontend needs
    if (response && Array.isArray(response.categories)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return response.categories.map((category: any) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        iconUrl: category.iconUrl,
        slug: category.slug,
        status: category.status,
        serviceCount: category.serviceCount,
        createdAt: category.createdAt,
      }));
    }
    
    return [];
  } catch (error) {
    console.error("💥 Error fetching categories:", error);
    return getFallbackCategories();
  }
};

// Fallback categories in case API fails
const getFallbackCategories = (): Category[] => [
  {
    id: '1',
    name: 'All Services',
    description: 'All available services',
    slug: 'all-services',
    status: 'active',
    serviceCount: 0,
    createdAt: new Date().toISOString(),
  },
  // Add more fallback categories if needed
];

export default fetchCategories;