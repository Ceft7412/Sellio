import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface TagRegularIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const TagRegularIcon: React.FC<TagRegularIconProps> = ({
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
      aria-label="TagRegular"
      role="img"
    >
      <Path d="M14 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-2.87-5a2 2 0 0 0-1.43.58L3.02 9.25a2 2 0 0 0 0 2.83l4.95 4.95a2 2 0 0 0 2.83 0l6.63-6.63A2 2 0 0 0 18 8.98V4.03a2 2 0 0 0-1.99-2L11.12 2Zm-.72 1.3a1 1 0 0 1 .71-.3l4.9.03a1 1 0 0 1 .99 1v4.95a1 1 0 0 1-.29.7l-6.63 6.64a1 1 0 0 1-1.41 0l-4.95-4.95a1 1 0 0 1 0-1.41l6.68-6.67Z" />
    </Svg>
  );
};
