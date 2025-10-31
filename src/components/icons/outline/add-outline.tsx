import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface AddCircleRegularIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const AddCircleRegularIcon: React.FC<AddCircleRegularIconProps> = ({
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
      aria-label="AddCircleRegular"
      role="img"
    >
      <Path d="M6 10c0-.28.22-.5.5-.5h3v-3a.5.5 0 0 1 1 0v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3A.5.5 0 0 1 6 10Zm4 8a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-1a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
    </Svg>
  );
};
