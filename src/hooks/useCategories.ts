import { useQuery } from "@tanstack/react-query";
import { categoriesAPI } from "../constants/axios";

export interface Category {
  id: string;
  name: string;
  image_url: string | null;
  parentId: string | null;
  description: string | null;
}

interface CategoriesResponse {
  message: string;
  categories: Category[];
}

// Fetch all categories
export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await categoriesAPI.getAll();
      const data: CategoriesResponse = response.data;
      return data.categories;
    },
  });
};

// Fetch parent categories only
export const useParentCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["categories", "parent"],
    queryFn: async () => {
      const response = await categoriesAPI.getParentCategories();
      const data: CategoriesResponse = response.data;
      return data.categories;
    },
  });
};
