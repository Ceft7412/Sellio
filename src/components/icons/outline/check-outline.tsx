import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface CheckRegularIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const CheckRegularIcon: React.FC<CheckRegularIconProps> = ({
  size = 20,
  color = "currentColor",
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill={color}
      style={style}
      aria-label="CheckRegular"
      role="img"
    >
      <Path d="M7.03 13.9 3.56 10.45a.75.75 0 0 0-1.06 1.06l4 4a.75.75 0 0 0 1.06 0l10-10a.75.75 0 1 0-1.06-1.06L7.03 13.9Z" />
    </Svg>
  );
};
