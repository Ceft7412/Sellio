import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface BuildingShopRegularIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const BuildingShopRegularIcon: React.FC<
  BuildingShopRegularIconProps
> = ({
  size = 20, // Original SVG size is 20x20
  color = "currentColor", // Uses 'currentColor' from the original fill attribute
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill={color} // Svg fill will apply to the path
      style={style}
      aria-label="BuildingShopRegular"
      role="img"
    >
      <Path d="M11 11.5v3c0 .28.22.5.5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5Zm1 2.5v-2h2v2h-2ZM5 2a.5.5 0 0 0-.38.18l-2.5 3A.5.5 0 0 0 2 5.5V7a3 3 0 0 0 1 2.24v8.26c0 .28.22.5.5.5h13a.5.5 0 0 0 .5-.5V9.24A3 3 0 0 0 18 7V5.48c0-.09 0-.16-.12-.3l-2.5-3A.5.5 0 0 0 15 2H5Zm0 7a2 2 0 0 1-2-2V6h4v1a2 2 0 0 1-2 2Zm5 0a2 2 0 0 1-2-2V6h4v1a2 2 0 0 1-2 2Zm5 0a2 2 0 0 1-2-2V6h4v1a2 2 0 0 1-2 2ZM5 17H4V9.83a3 3 0 0 0 3.5-1.17 3 3 0 0 0 5 0A3 3 0 0 0 16 9.83V17h-6v-5.5a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5V17ZM7.14 5H3.57l1.66-2h2.58l-.67 2Zm4.67 0H8.19l.67-2h2.28l.67 2Zm1.05 0-.67-2h2.58l1.66 2h-3.57ZM6 17v-5h3v5H6Z" />
    </Svg>
  );
};
