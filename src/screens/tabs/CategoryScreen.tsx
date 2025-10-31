import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SearchRegularIcon } from "../../components/icons/outline/search-outline";
import { categoriesAPI } from "../../constants/axios";
import { CategoryLoadingState } from "../../components/states/loading";

// Types
interface Category {
  id: string;
  name: string;
  image_url: string | null;
  parentId: string | null;
  description?: string | null;
  totalProducts: number;
}

// Category Card Component
const CategoryCard: React.FC<{ category: Category; onPress: () => void }> = ({
  category,
  onPress,
}) => {
  // Default image for categories without one
  const defaultImage =
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-[48%] mb-4 bg-white rounded-2xl overflow-hidden shadow-sm"
      activeOpacity={0.7}
    >
      {/* Category Image */}
      <View className="w-full h-32 bg-neutral-200">
        <Image
          source={{ uri: category.image_url || defaultImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {/* Gradient Overlay */}
        <View className="absolute inset-0 bg-black/20" />
      </View>

      {/* Category Info */}
      <View className="p-3">
        <Text
          className="text-sm font-inter-semiBold text-neutral-900 mb-1"
          numberOfLines={1}
        >
          {category.name}
        </Text>
        <Text className="text-xs font-inter-regular text-neutral-500">
          {category.totalProducts.toLocaleString()} items
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function CategoryScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await categoriesAPI.getAllCategoriesWithTotalProducts();

      setCategories(response.data.categories);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchCategories(true);
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryPress = (category: Category) => {
    Alert.alert("Category", `Navigate to ${category.name} products`);
    // TODO: Navigate to category products screen
    // navigation.navigate("CategoryProducts", { categoryId: category.id, categoryName: category.name });
  };

  const handleSearchFocus = () => {
    // TODO: Navigate to dedicated search screen if needed
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-neutral-100">
        <Text className="text-2xl font-inter-bold text-primary-500 mb-4">
          Categories
        </Text>

        {/* Search Bar */}
        <View className="relative">
          <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <SearchRegularIcon size={20} color="#6B7280" />
          </View>
          <TextInput
            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-inter-regular text-neutral-900 text-base"
            placeholder="Search categories..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
          />
        </View>
      </View>

      {/* Categories Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-6 pt-6 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#0D3F81"]}
            tintColor="#0D3F81"
          />
        }
      >
        {/* Loading State */}
        {isLoading && <CategoryLoadingState count={6} />}

        {/* Error State */}
        {error && !isLoading && (
          <View className="items-center justify-center py-20 px-6">
            <Text className="text-5xl mb-4">⚠️</Text>
            <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2">
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => fetchCategories()}
              className="mt-4 px-6 py-3 bg-primary-500 rounded-xl"
            >
              <Text className="text-white font-inter-semiBold">Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Categories List */}
        {!isLoading && !error && (
          <>
            {filteredCategories.length > 0 ? (
              <View className="flex-row flex-wrap justify-between">
                {filteredCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onPress={() => handleCategoryPress(category)}
                  />
                ))}
              </View>
            ) : (
              // Empty State
              <View className="items-center justify-center py-20 px-6">
                <SearchRegularIcon size={100} color="#6B7280" />
                <Text className="text-lg font-inter-semiBold text-neutral-800 mb-2">
                  {searchQuery
                    ? "No categories found"
                    : "No categories available"}
                </Text>
                <Text className="text-sm font-inter-regular text-neutral-500 text-center">
                  {searchQuery
                    ? "Try searching with different keywords"
                    : "Categories will appear here once added."}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
