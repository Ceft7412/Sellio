import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface MoreVerticalRegularIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const MoreVerticalRegularIcon: React.FC<MoreVerticalRegularIconProps> = ({
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
      aria-label="MoreVerticalRegular"
      role="img"
    >
      <Path
        d="M10 6a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 10 6Zm0 5.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm-1.25 4a1.25 1.25 0 1 0 2.5 0 1.25 1.25 0 0 0-2.5 0Z"
      />
    </Svg>
  );
};