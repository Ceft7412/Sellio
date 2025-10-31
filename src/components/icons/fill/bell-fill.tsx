import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface AlertFilledIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const AlertFilledIcon: React.FC<AlertFilledIconProps> = ({
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
      aria-label="AlertFilled"
      role="img"
    >
      <Path d="M12.45 16a2.5 2.5 0 0 1-4.9 0h4.9ZM10 2a5.92 5.92 0 0 1 5.98 5.36l.02.22V11.4l.95 2.6.03.08.01.09v.08c0 .32-.19.6-.51.71l-.12.03-.11.01H3.75a.75.75 0 0 1-.74-.76v-.12l.04-.12L4 11.4V7.57A5.9 5.9 0 0 1 10 2Z" />
    </Svg>
  );
};
