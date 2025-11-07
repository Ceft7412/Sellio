import React, {
  forwardRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { ArrowLeftOutlineIcon } from "../icons/outline/arrow-left-outline";
import { ChevronRightRegularIcon } from "../icons/outline/chevron-outline";
import { categoriesAPI } from "../../constants/axios";

// Types
interface Category {
  id: string;
  name: string;
  image_url: string | null;
  parentId: string | null;
  description?: string | null;
}

interface SellBottomSheetProps {
  onCategorySelect: (category: Category) => void;
}

// Category Item Component
const CategoryItem: React.FC<{
  category: Category;
  onPress: () => void;
  showChevron?: boolean;
}> = ({ category, onPress, showChevron = false }) => {
  // Default image for categories without one
  const defaultImage =
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4 px-5 bg-white border-b border-neutral-100 active:bg-neutral-50"
      activeOpacity={0.7}
    >
      <View className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-200 mr-3">
        <Image
          source={{ uri: category.image_url || defaultImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      <View className="flex-1">
        <Text className="text-base font-inter-semiBold text-neutral-900 mb-0.5">
          {category.name}
        </Text>
        {category.description && (
          <Text className="text-xs font-inter-regular text-neutral-500">
            {category.description}
          </Text>
        )}
      </View>
      {showChevron && <ChevronRightRegularIcon size={20} color="#9CA3AF" />}
    </TouchableOpacity>
  );
};

const SellBottomSheet = forwardRef<BottomSheetModal, SellBottomSheetProps>(
  ({ onCategorySelect }, ref) => {
    const [selectedParentCategory, setSelectedParentCategory] =
      useState<Category | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Bottom sheet snap points
    const snapPoints = useMemo(() => ["75%", "90%"], []);

    // Fetch categories from API
    useEffect(() => {
      fetchCategories();
    }, []);

    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data.categories);
      } catch (err: any) {
        setError("Failed to load categories. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    // Get parent categories
    const parentCategories = useMemo(
      () => categories.filter((cat) => cat.parentId === null),
      [categories]
    );

    // Get subcategories based on selected parent
    const subcategories = useMemo(() => {
      if (!selectedParentCategory) return [];
      return categories.filter(
        (cat) => cat.parentId === selectedParentCategory.id
      );
    }, [selectedParentCategory, categories]);

    // Backdrop component
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    // Handle parent category press
    const handleParentCategoryPress = (category: Category) => {
      setSelectedParentCategory(category);
    };

    // Handle subcategory press (final selection)
    const handleSubcategoryPress = (category: Category) => {
      onCategorySelect(category);
      // Reset state
      setSelectedParentCategory(null);
      // Close bottom sheet
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    // Handle back button
    const handleBack = () => {
      setSelectedParentCategory(null);
    };

    // Handle sheet changes
    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1) {
        // Reset when sheet is closed
        setSelectedParentCategory(null);
      }
    }, []);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={true}
        onChange={handleSheetChanges}
        enablePanDownToClose
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.background}
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-neutral-100">
          <View className="flex-row items-center">
            {selectedParentCategory && (
              <TouchableOpacity
                onPress={handleBack}
                className="mr-3 w-10 h-10 rounded-full bg-neutral-100 items-center justify-center"
                activeOpacity={0.7}
              >
                <ArrowLeftOutlineIcon size={20} color="#374151" />
              </TouchableOpacity>
            )}
            <View className="flex-1">
              <Text className="text-xl font-inter-bold text-primary-500">
                {selectedParentCategory
                  ? selectedParentCategory.name
                  : "Select Category"}
              </Text>
              <Text className="text-sm font-inter-regular text-neutral-600 mt-0.5">
                {selectedParentCategory
                  ? "Choose a subcategory"
                  : "What are you selling?"}
              </Text>
            </View>
          </View>
        </View>

        {/* Category List */}
        <BottomSheetScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Loading State */}
          {isLoading && (
            <View className="items-center justify-center py-12 px-6">
              <ActivityIndicator size="large" color="#0D3F81" />
              <Text className="text-sm font-inter-regular text-neutral-600 mt-3">
                Loading categories...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <View className="items-center justify-center py-12 px-6">
              <Text className="text-4xl mb-3">⚠️</Text>
              <Text className="text-base font-inter-semiBold text-neutral-800 mb-2">
                {error}
              </Text>
              <TouchableOpacity
                onPress={fetchCategories}
                className="mt-4 px-6 py-3 bg-primary-500 rounded-xl"
              >
                <Text className="text-white font-inter-semiBold">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Categories List */}
          {!isLoading && !error && (
            <>
              {!selectedParentCategory ? (
                // Show parent categories
                <View>
                  {parentCategories.length === 0 ? (
                    <View className="items-center justify-center py-12 px-6">
                      <Text className="text-4xl mb-3">📦</Text>
                      <Text className="text-base font-inter-semiBold text-neutral-800 mb-2">
                        No categories available
                      </Text>
                      <Text className="text-sm font-inter-regular text-neutral-500 text-center">
                        Please check back later.
                      </Text>
                    </View>
                  ) : (
                    parentCategories.map((category) => (
                      <CategoryItem
                        key={category.id}
                        category={category}
                        onPress={() => handleParentCategoryPress(category)}
                        showChevron={true}
                      />
                    ))
                  )}
                </View>
              ) : (
                // Show subcategories
                <View>
                  {subcategories.length === 0 ? (
                    <View className="items-center justify-center py-12 px-6">
                      <Text className="text-4xl mb-3">📦</Text>
                      <Text className="text-base font-inter-semiBold text-neutral-800 mb-2">
                        No subcategories
                      </Text>
                      <Text className="text-sm font-inter-regular text-neutral-500 text-center">
                        This category doesn't have any subcategories yet.
                      </Text>
                    </View>
                  ) : (
                    subcategories.map((category) => (
                      <CategoryItem
                        key={category.id}
                        category={category}
                        onPress={() => handleSubcategoryPress(category)}
                        showChevron={false}
                      />
                    ))
                  )}
                </View>
              )}
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: "#D1D5DB",
    width: 40,
  },
  background: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    paddingBottom: 24,
  },
});

SellBottomSheet.displayName = "SellBottomSheet";

export default SellBottomSheet;
