import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface SendFilledIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const SendFilledIcon: React.FC<SendFilledIconProps> = ({
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
      aria-label="SendFilled"
      role="img"
    >
      <Path
        d="M2.72 2.05a.5.5 0 0 0-.7.58l1.5 5.62c.05.19.2.33.4.36l6.85 1.14c.28.05.28.45 0 .5l-6.85 1.14a.5.5 0 0 0-.4.36l-1.5 5.62a.5.5 0 0 0 .7.58l15-7.5a.5.5 0 0 0 0-.9l-15-7.5Z"
      />
    </Svg>
  );
};