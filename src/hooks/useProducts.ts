import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsAPI } from "../constants/axios";

export interface Product {
  id: string;
  title: string;
  price: number;
  coverImage: string;
  location:string;
  category: string;
  saleType: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;

  };
}

interface ProductsResponse {
  message: string;
  products: any[];
  count: number;
  limit: number;
  offset: number;
}

interface ProductsParams {
  category?: string;
  sub_category?: string;
  status?: string;
  saleType?: string;
  limit?: number;
  offset?: number;
}

// Fetch all products
export const useProducts = (params?: ProductsParams) => {
  return useQuery<Product[]>({
    queryKey: ["products", params],
    queryFn: async () => {
      const response = await productsAPI.getAll(params);
      const data: ProductsResponse = response.data;


      // Map backend data to frontend interface
      return data.products.map((prod: any) => ({
        id: prod.id,
        title: prod.title,
        price: parseFloat(prod.price),
        coverImage: prod.coverImage || "https://via.placeholder.com/400",
        category: prod.subCategory?.name || prod.category?.name || "Unknown",
        location: prod.location || "Unknown",
        saleType: prod.saleType || "Unknown",
        seller: {
          id: prod.seller?.id || "unknown",
          name: prod.seller?.displayName || "Anonymous Seller",
          avatar: prod.seller?.avatarUrl,
          verified: prod.seller?.identityVerifiedAt !== null,
        },
      }));
    },
  });
};

// Fetch single product by ID
export const useProductById = (productId: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const response = await productsAPI.getById(productId);
      return response.data.product;
    },
    enabled: !!productId, // Only run query if productId is provided
  });
};

// Create product mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await productsAPI.create(formData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// Toggle favorite mutation
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await productsAPI.toggleFavorite(productId);
      return response.data;
    },
    onSuccess: (data, productId) => {
      // Invalidate products to update favorite status
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};

// Fetch user's favorite products
export const useUserFavorites = () => {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await productsAPI.getUserFavorites();
      const data = response.data;

      // Map favorites to Product interface
      return data.favorites.map((favorite: any) => ({
        id: favorite.product.id,
        title: favorite.product.title,
        price: parseFloat(favorite.product.price),
        coverImage: favorite.product.coverImage || "https://via.placeholder.com/400",
        category: favorite.product.subCategory?.name || favorite.product.category?.name || "Unknown",
        location: favorite.product.location || "Unknown",
        saleType: favorite.product.saleType || "Unknown",
        seller: {
          id: favorite.product.seller?.id || "unknown",
          name: favorite.product.seller?.displayName || "Anonymous Seller",
          avatar: favorite.product.seller?.avatarUrl,
          verified: favorite.product.seller?.verified !== null,
        },
      }));
    },
  });
};
