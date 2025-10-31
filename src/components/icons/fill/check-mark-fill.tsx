import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface CheckmarkCircleFilledIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const CheckmarkCircleFilledIcon: React.FC<CheckmarkCircleFilledIconProps> = ({
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
      aria-label="CheckmarkCircleFilled"
      role="img"
    >
      <Path
        d="M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm3.36 5.65a.5.5 0 0 0-.64-.06l-.07.06L9 11.3 7.35 9.65l-.07-.06a.5.5 0 0 0-.7.7l.07.07 2 2 .07.06c.17.11.4.11.56 0l.07-.064-4 .07-.08a.5.5 0 0 0-.06-.63Z"
      />
    </Svg>
  );
};