import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface ShareIosRegularIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const ShareIosRegularIcon: React.FC<ShareIosRegularIconProps> = ({
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
      aria-label="ShareIosRegular"
      role="img"
    >
      <Path d="M10.35 2.15a.5.5 0 0 0-.7 0l-4.5 4.5a.5.5 0 1 0 .7.7L9.5 3.71v8.79a.5.5 0 0 0 1 0V3.7l3.65 3.65a.5.5 0 0 0 .7-.7l-4.5-4.5ZM4 9.5a.5.5 0 0 0-1 0V14a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V9.5a.5.5 0 0 0-1 0V14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9.5Z" />
    </Svg>
  );
};
