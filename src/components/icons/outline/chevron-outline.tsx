import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface ChevronRightRegularIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const ChevronRightRegularIcon: React.FC<
  ChevronRightRegularIconProps
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
      aria-label="ChevronRightRegular"
      role="img"
    >
      <Path d="M7.65 4.15c.2-.2.5-.2.7 0l5.49 5.46c.21.22.21.57 0 .78l-5.49 5.46a.5.5 0 0 1-.7-.7L12.8 10 7.65 4.85a.5.5 0 0 1 0-.7Z" />
    </Svg>
  );
};
