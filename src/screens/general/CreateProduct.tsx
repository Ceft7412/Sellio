import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import SellBottomSheet from "../../components/bottomsheets/SellBottomSheet";
import { categoriesAPI } from "../../constants/axios";
import { ChevronRightRegularIcon } from "../../components/icons/outline/chevron-outline";
import { XMarkRegularIcon } from "../../components/icons/outline/xmark-outline";
import { CameraRegularIcon } from "../../components/icons/outline/camera-outline";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useCreateProduct } from "../../hooks/useProducts";

// Types
interface Category {
  id: string;
  name: string;
  image_url: string | null;
  parentId: string | null;
  description?: string | null;
}

interface CategoryAttribute {
  id: string;
  categoryId: string;
  subCategoryId: string | null;
  attributeKey: string;
  label: string;
  type: string;
  isRequired: boolean;
  validation: any;
  helpText: string | null;
  options: any;
  placeholder: string | null;
  sortOrder: number;
}

interface ProductImage {
  uri: string;
  isCover: boolean;
}

type SaleType = "fixed" | "negotiable" | "bidding";

type CreateProductRouteParams = {
  selectedCategory?: Category;
};

const CONDITION_OPTIONS = [
  { value: "new", label: "Brand New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

export default function CreateProduct() {
  // Get route params and navigation
  const route =
    useRoute<RouteProp<{ params: CreateProductRouteParams }, "params">>();
  const navigation = useNavigation();
  const categoryFromRoute = route.params?.selectedCategory;

  // TanStack Query mutation
  const createProductMutation = useCreateProduct();

  // Bottom Sheet Ref
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    categoryFromRoute || null
  );
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("good");
  const [location, setLocation] = useState("");
  const [saleType, setSaleType] = useState<SaleType>("fixed");
  const [minimumBid, setMinimumBid] = useState("");
  const [images, setImages] = useState<ProductImage[]>([]);
  const [maintenanceImages, setMaintenanceImages] = useState<ProductImage[]>(
    []
  );
  const [dynamicAttributes, setDynamicAttributes] = useState<{
    [key: string]: any;
  }>({});

  // Category Attributes
  const [categoryAttributes, setCategoryAttributes] = useState<
    CategoryAttribute[]
  >([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  // Initialize with category from route params
  useEffect(() => {
    if (categoryFromRoute) {
      setSelectedCategory(categoryFromRoute);
    }
  }, [categoryFromRoute]);

  // Fetch parent category when subcategory is selected
  useEffect(() => {
    if (selectedCategory?.parentId) {
      fetchParentCategory(selectedCategory.parentId);
    }
  }, [selectedCategory]);

  // Fetch category attributes when category is selected
  useEffect(() => {
    if (selectedCategory?.parentId && selectedCategory?.id) {
      fetchCategoryAttributes(selectedCategory.parentId, selectedCategory.id);
    }
  }, [selectedCategory]);

  const fetchParentCategory = async (parentId: string) => {
    try {
      const response = await categoriesAPI.getById(parentId);
      setParentCategory(response.data.category);
    } catch (error) {}
  };

  const fetchCategoryAttributes = async (
    categoryId: string,
    subCategoryId: string
  ) => {
    setLoadingAttributes(true);
    try {
      const response = await categoriesAPI.getCategoryAttributes(
        categoryId,
        subCategoryId
      );
      setCategoryAttributes(response.data.attributes || []);
    } catch (error) {
      Alert.alert("Error", "Failed to load category attributes");
    } finally {
      setLoadingAttributes(false);
    }
  };

  const handleOpenCategorySelector = () => {
    bottomSheetRef.current?.present();
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setDynamicAttributes({}); // Reset dynamic attributes
  };

  // Image Picker
  const pickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need camera roll permissions to upload images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10 - images.length,
      });

      if (!result.canceled) {
        const newImages: ProductImage[] = result.assets.map((asset) => ({
          uri: asset.uri,
          isCover: images.length === 0, // First image is cover by default
        }));
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images");
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const removedImage = newImages[index];
    newImages.splice(index, 1);

    // If removed image was cover, make first image the cover
    if (removedImage.isCover && newImages.length > 0) {
      newImages[0].isCover = true;
    }

    setImages(newImages);
  };

  const setCoverImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isCover: i === index,
    }));
    setImages(newImages);
  };

  // Maintenance Images Picker
  const pickMaintenanceImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need camera roll permissions to upload images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10 - maintenanceImages.length,
      });

      if (!result.canceled) {
        const newImages: ProductImage[] = result.assets.map((asset) => ({
          uri: asset.uri,
          isCover: false, // Maintenance images don't have cover
        }));
        setMaintenanceImages([...maintenanceImages, ...newImages]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images");
    }
  };

  const removeMaintenanceImage = (index: number) => {
    const newImages = [...maintenanceImages];
    newImages.splice(index, 1);
    setMaintenanceImages(newImages);
  };

  const handleDynamicAttributeChange = (key: string, value: any) => {
    setDynamicAttributes((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter a product title");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("Validation Error", "Please enter a product description");
      return false;
    }
    if (!price.trim()) {
      Alert.alert("Validation Error", "Please enter a price");
      return false;
    }
    if (!selectedCategory) {
      Alert.alert("Validation Error", "Please select a category");
      return false;
    }
    if (images.length === 0) {
      Alert.alert("Validation Error", "Please add at least one image");
      return false;
    }
    if (saleType === "bidding" && !minimumBid.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter a minimum bid amount for bidding"
      );
      return false;
    }

    // Validate required dynamic attributes
    for (const attr of categoryAttributes) {
      if (attr.isRequired && !dynamicAttributes[attr.attributeKey]) {
        Alert.alert(
          "Validation Error",
          `Please fill in the required field: ${attr.label}`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Create FormData for multipart/form-data submission
      const formData = new FormData();

      // Add basic product fields
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("condition", condition);
      formData.append("saleType", saleType);

      // Add optional fields
      if (location) formData.append("location", location);
      if (parentCategory?.id) formData.append("category_id", parentCategory.id);
      if (selectedCategory?.id)
        formData.append("sub_category_id", selectedCategory.id);

      // Add bidding-specific fields
      if (saleType === "bidding" && minimumBid) {
        formData.append("minimumBid", minimumBid);
      }

      // Add dynamic attributes as JSON string
      if (Object.keys(dynamicAttributes).length > 0) {
        formData.append("dynamicAttributes", JSON.stringify(dynamicAttributes));
      }

      // Add product images - need to fetch them as blobs and append to FormData
      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        // Fetch the image as blob
        const response = await fetch(image.uri);
        const blob = await response.blob();

        // Extract filename from URI or create one
        const uriParts = image.uri.split("/");
        const fileName = uriParts[uriParts.length - 1] || `image_${i}.jpg`;

        // Append to formData
        // @ts-ignore - FormData typing issue with React Native
        formData.append("images", {
          uri: image.uri,
          type: blob.type || "image/jpeg",
          name: fileName,
        });
      }

      // Add maintenance images
      for (let i = 0; i < maintenanceImages.length; i++) {
        const image = maintenanceImages[i];

        // Fetch the image as blob
        const response = await fetch(image.uri);
        const blob = await response.blob();

        // Extract filename from URI or create one
        const uriParts = image.uri.split("/");
        const fileName =
          uriParts[uriParts.length - 1] || `maintenance_${i}.jpg`;

        // Append to formData with field name 'maintenanceImages'
        // @ts-ignore - FormData typing issue with React Native
        formData.append("maintenanceImages", {
          uri: image.uri,
          type: blob.type || "image/jpeg",
          name: fileName,
        });
      }

      // Submit using TanStack Query mutation
      await createProductMutation.mutateAsync(formData);

      Alert.alert(
        "Success",
        "Product created successfully! Images are being uploaded.",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to main screen or product list
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create product. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  const renderDynamicField = (attribute: CategoryAttribute) => {
    const value = dynamicAttributes[attribute.attributeKey];

    switch (attribute.type) {
      case "text":
      case "number":
        return (
          <View key={attribute.id} className="mb-4">
            <Text className="text-sm font-inter-semiBold text-neutral-900 mb-2">
              {attribute.label}
              {attribute.isRequired && (
                <Text className="text-error-500"> *</Text>
              )}
            </Text>
            {attribute.helpText && (
              <Text className="text-xs font-inter-regular text-neutral-500 mb-2">
                {attribute.helpText}
              </Text>
            )}
            <TextInput
              className="bg-white border border-neutral-200 rounded-xl px-4 py-3 font-inter-regular text-base text-neutral-900"
              placeholder={attribute.placeholder || `Enter ${attribute.label}`}
              value={value || ""}
              onChangeText={(text) =>
                handleDynamicAttributeChange(attribute.attributeKey, text)
              }
              keyboardType={attribute.type === "number" ? "numeric" : "default"}
            />
          </View>
        );

      case "select":
      case "dropdown":
        return (
          <View key={attribute.id} className="mb-4">
            <Text className="text-sm font-inter-semiBold text-neutral-900 mb-2">
              {attribute.label}
              {attribute.isRequired && (
                <Text className="text-error-500"> *</Text>
              )}
            </Text>
            {attribute.helpText && (
              <Text className="text-xs font-inter-regular text-neutral-500 mb-2">
                {attribute.helpText}
              </Text>
            )}
            <View className="flex-row flex-wrap">
              {attribute.options?.map((option: any) => {
                const optionValue =
                  typeof option === "string" ? option : option.value;
                const optionLabel =
                  typeof option === "string" ? option : option.label;
                const isSelected = value === optionValue;

                return (
                  <TouchableOpacity
                    key={optionValue}
                    onPress={() =>
                      handleDynamicAttributeChange(
                        attribute.attributeKey,
                        optionValue
                      )
                    }
                    className={`mr-2 mb-2 px-4 py-2 rounded-lg border ${
                      isSelected
                        ? "bg-primary-500 border-primary-500"
                        : "bg-white border-neutral-200"
                    }`}
                  >
                    <Text
                      className={`font-inter-medium text-sm ${
                        isSelected ? "text-white" : "text-neutral-700"
                      }`}
                    >
                      {optionLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case "textarea":
        return (
          <View key={attribute.id} className="mb-4">
            <Text className="text-sm font-inter-semiBold text-neutral-900 mb-2">
              {attribute.label}
              {attribute.isRequired && (
                <Text className="text-error-500"> *</Text>
              )}
            </Text>
            {attribute.helpText && (
              <Text className="text-xs font-inter-regular text-neutral-500 mb-2">
                {attribute.helpText}
              </Text>
            )}
            <TextInput
              className="bg-white border border-neutral-200 rounded-xl px-4 py-3 font-inter-regular text-base text-neutral-900"
              placeholder={attribute.placeholder || `Enter ${attribute.label}`}
              value={value || ""}
              onChangeText={(text) =>
                handleDynamicAttributeChange(attribute.attributeKey, text)
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-6 py-4">
        <Text className="text-2xl font-inter-bold text-primary-500">
          Create Listing
        </Text>
        <Text className="text-sm font-inter-regular text-neutral-600 mt-1">
          Fill in the details to list your item
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Images Section */}
        <View className="bg-white px-6 py-4 mb-2">
          <Text className="text-lg font-inter-bold text-neutral-900 mb-3">
            Photos <Text className="text-error-500">*</Text>
          </Text>
          <Text className="text-sm font-inter-regular text-neutral-600 mb-4">
            Add up to 10 photos. Tap on an image to set it as cover.
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Add Image Button */}
            {images.length < 10 && (
              <TouchableOpacity
                onPress={pickImages}
                className="w-24 h-24 rounded-xl bg-neutral-100 items-center justify-center mr-3 border-2 border-dashed border-neutral-300"
              >
                <CameraRegularIcon size={32} color="#9CA3AF" />
                <Text className="text-xs font-inter-medium text-neutral-500 mt-1">
                  Add Photo
                </Text>
              </TouchableOpacity>
            )}

            {/* Image List */}
            {images.map((image, index) => (
              <View key={index} className="mr-3">
                <TouchableOpacity
                  onPress={() => setCoverImage(index)}
                  className="w-24 h-24 rounded-xl overflow-hidden relative"
                >
                  <Image
                    source={{ uri: image.uri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {/* Cover Badge */}
                  {image.isCover && (
                    <View className="absolute top-1 left-1 bg-primary-500 px-2 py-0.5 rounded">
                      <Text className="text-xs font-inter-semiBold text-white">
                        Cover
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {/* Remove Button */}
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute  -right-2 w-6 h-6 rounded-full bg-error-500 items-center justify-center"
                >
                  <XMarkRegularIcon size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Maintenance Checklist Photos (only for vehicles) */}
        {categoryAttributes.some(
          (attr) => attr.attributeKey === "maintenance_checklist"
        ) && (
          <View className="bg-white px-6 py-4 mb-2">
            <Text className="text-lg font-inter-bold text-neutral-900 mb-3">
              Maintenance Checklist
            </Text>
            <Text className="text-sm font-inter-regular text-neutral-600 mb-4">
              Upload photos of maintenance records, service history, or
              inspection reports (optional, up to 10 photos)
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {/* Add Image Button */}
              {maintenanceImages.length < 10 && (
                <TouchableOpacity
                  onPress={pickMaintenanceImages}
                  className="w-24 h-24 rounded-xl bg-neutral-100 items-center justify-center mr-3 border-2 border-dashed border-neutral-300"
                >
                  <CameraRegularIcon size={32} color="#9CA3AF" />
                  <Text className="text-xs font-inter-medium text-neutral-500 mt-1">
                    Add Photo
                  </Text>
                </TouchableOpacity>
              )}

              {/* Image List */}
              {maintenanceImages.map((image, index) => (
                <View key={index} className="mr-3">
                  <View className="w-24 h-24 rounded-xl overflow-hidden relative">
                    <Image
                      source={{ uri: image.uri }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  {/* Remove Button */}
                  <TouchableOpacity
                    onPress={() => removeMaintenanceImage(index)}
                    className="absolute -right-2 w-6 h-6 rounded-full bg-error-500 items-center justify-center"
                  >
                    <XMarkRegularIcon size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Category Selection */}
        <View className="bg-white px-6 py-4 mb-2">
          <Text className="text-lg font-inter-bold text-neutral-900 mb-3">
            Category <Text className="text-error-500">*</Text>
          </Text>
          <TouchableOpacity
            onPress={handleOpenCategorySelector}
            className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
          >
            <View className="flex-1">
              {selectedCategory ? (
                <>
                  <Text className="text-sm font-inter-regular text-neutral-500">
                    {parentCategory?.name}
                  </Text>
                  <Text className="text-base font-inter-semiBold text-neutral-900 mt-0.5">
                    {selectedCategory.name}
                  </Text>
                </>
              ) : (
                <Text className="text-base font-inter-regular text-neutral-500">
                  Select a category
                </Text>
              )}
            </View>
            <ChevronRightRegularIcon size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Basic Details */}
        <View className="bg-white px-6 py-4 mb-2">
          <Text className="text-lg font-inter-bold text-neutral-900 mb-4">
            Basic Details
          </Text>

          {/* Title */}
          <View className="mb-4">
            <Text className="text-sm font-inter-semiBold text-neutral-900 mb-2">
              Title <Text className="text-error-500">*</Text>
            </Text>
            <TextInput
              className="bg-white border border-neutral-200 rounded-xl px-4 py-3 font-inter-regular text-base text-neutral-900"
              placeholder="Enter product title"
              value={title}
              onChangeText={setTitle}
              maxLength={200}
            />
            <Text className="text-xs font-inter-regular text-neutral-500 mt-1">
              {title.length}/200
            </Text>
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-inter-semiBold text-neutral-900 mb-2">
              Description <Text className="text-error-500">*</Text>
            </Text>
            <TextInput
              className="bg-white border border-neutral-200 rounded-xl px-4 py-3 font-inter-regular text-base text-neutral-900"
              placeholder="Describe your item in detail"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Condition */}
          <View className="mb-4">
            <Text className="text-sm font-inter-semiBold text-neutral-900 mb-2">
              Condition <Text className="text-error-500">*</Text>
            </Text>
            <View className="flex-row flex-wrap">
              {CONDITION_OPTIONS.map((option) => {
                const isSelected = condition === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setCondition(option.value)}
                    className={`mr-2 mb-2 px-4 py-2 rounded-lg border ${
                      isSelected
                        ? "bg-primary-500 border-primary-500"
                        : "bg-white border-neutral-200"
                    }`}
                  >
                    <Text
                      className={`font-inter-medium text-sm ${
                        isSelected ? "text-white" : "text-neutral-700"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Location */}
          <View>
            <Text className="text-sm font-inter-semiBold text-neutral-900 mb-2">
              Location
            </Text>
            <TextInput
              className="bg-white border border-neutral-200 rounded-xl px-4 py-3 font-inter-regular text-base text-neutral-900"
              placeholder="Enter your location"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Pricing & Sale Type */}
        <View className="bg-white px-6 py-4 mb-2">
          <Text className="text-lg font-inter-bold text-neutral-900 mb-4">
            Pricing
          </Text>

          {/* Sale Type */}
          <View className="mb-4">
            <Text className="text-sm font-inter-semiBold text-neutral-900 mb-2">
              Sale Type <Text className="text-error-500">*</Text>
            </Text>
            <View className="space-y-2">
              {/* Fixed Price */}
              <TouchableOpacity
                onPress={() => setSaleType("fixed")}
                className={`border rounded-xl px-4 py-3 flex-row items-center ${
                  saleType === "fixed"
                    ? "border-primary-500 bg-primary-50"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                    saleType === "fixed"
                      ? "border-primary-500"
                      : "border-neutral-300"
                  }`}
                >
                  {saleType === "fixed" && (
                    <View className="w-3 h-3 rounded-full bg-primary-500" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-inter-semiBold text-neutral-900">
                    Fixed Price
                  </Text>
                  <Text className="text-xs font-inter-regular text-neutral-600 mt-0.5">
                    Sell at a set price
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Negotiable */}
              <TouchableOpacity
                onPress={() => setSaleType("negotiable")}
                className={`border rounded-xl px-4 py-3 flex-row items-center mt-2 ${
                  saleType === "negotiable"
                    ? "border-primary-500 bg-primary-50"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                    saleType === "negotiable"
                      ? "border-primary-500"
                      : "border-neutral-300"
                  }`}
                >
                  {saleType === "negotiable" && (
                    <View className="w-3 h-3 rounded-full bg-primary-500" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-inter-semiBold text-neutral-900">
                    Negotiable
                  </Text>
                  <Text className="text-xs font-inter-regular text-neutral-600 mt-0.5">
                    Accept offers from buyers
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Bidding */}
              <TouchableOpacity
                onPress={() => setSaleType("bidding")}
                className={`border rounded-xl px-4 py-3 flex-row items-center mt-2 ${
                  saleType === "bidding"
                    ? "border-primary-500 bg-primary-50"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                    saleType === "bidding"
                      ? "border-primary-500"
                      : "border-neutral-300"
                  }`}
                >
                  {saleType === "bidding" && (
                    <View className="w-3 h-3 rounded-full bg-primary-500" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-inter-semiBold text-neutral-900">
                    Bidding
                  </Text>
                  <Text className="text-xs font-inter-regular text-neutral-600 mt-0.5">
                    Let buyers bid on your item
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price */}
          <View className="mb-4">
            <Text className="text-sm font-inter-semiBold text-neutral-900 mb-2">
              Price <Text className="text-error-500">*</Text>
            </Text>
            <View className="bg-white border border-neutral-200 rounded-xl px-4 py-3 flex-row items-center">
              <Text className="text-base font-inter-semiBold text-neutral-700 mr-2">
                ₱
              </Text>
              <TextInput
                className="flex-1 font-inter-regular text-base text-neutral-900"
                placeholder="0.00"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Minimum Bid (only for bidding) */}
          {saleType === "bidding" && (
            <View>
              <Text className="text-sm font-inter-semiBold text-neutral-900 mb-2">
                Minimum Bid Amount <Text className="text-error-500">*</Text>
              </Text>
              <View className="bg-white border border-neutral-200 rounded-xl px-4 py-3 flex-row items-center">
                <Text className="text-base font-inter-semiBold text-neutral-700 mr-2">
                  ₱
                </Text>
                <TextInput
                  className="flex-1 font-inter-regular text-base text-neutral-900"
                  placeholder="0.00"
                  value={minimumBid}
                  onChangeText={setMinimumBid}
                  keyboardType="decimal-pad"
                />
              </View>
              <Text className="text-xs font-inter-regular text-neutral-500 mt-1">
                The minimum amount buyers can bid
              </Text>
            </View>
          )}
        </View>

        {/* Dynamic Category Attributes */}
        {selectedCategory && (
          <View className="bg-white px-6 py-4 mb-2">
            <Text className="text-lg font-inter-bold text-neutral-900 mb-4">
              Additional Details
            </Text>

            {loadingAttributes ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#0D3F81" />
                <Text className="text-sm font-inter-regular text-neutral-600 mt-3">
                  Loading category fields...
                </Text>
              </View>
            ) : categoryAttributes.length > 0 ? (
              categoryAttributes
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((attr) => renderDynamicField(attr))
            ) : (
              <Text className="text-sm font-inter-regular text-neutral-500 text-center py-4">
                No additional fields required for this category
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-6 py-4 pb-10">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={createProductMutation.isPending}
          className={`rounded-xl py-4 items-center ${
            createProductMutation.isPending
              ? "bg-primary-300"
              : "bg-primary-500"
          }`}
        >
          {createProductMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-base font-inter-bold text-white">
              Create Listing
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Bottom Sheet */}
      <SellBottomSheet
        ref={bottomSheetRef}
        onCategorySelect={handleCategorySelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
