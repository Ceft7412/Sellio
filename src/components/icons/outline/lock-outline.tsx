import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface LockClosedOutlineIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const LockClosedOutlineIcon: React.FC<LockClosedOutlineIconProps> = ({
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
      aria-label="LockClosedRegular"
      role="img"
    >
      <Path d="M10 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM6 6h1V5a3 3 0 0 1 6 0v1h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Zm4-3a2 2 0 0 0-2 2v1h4V5a2 2 0 0 0-2-2Zm6 6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V9Z" />
    </Svg>
  );
};
