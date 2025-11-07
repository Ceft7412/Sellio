import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface ShareRegularIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const ShareRegularIcon: React.FC<ShareRegularIconProps> = ({
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
      aria-label="ShareRegular"
      role="img"
    >
      <Path d="M9.5 3a.5.5 0 0 1 0 1H6a2 2 0 0 0-2 2v8c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-1.5a.5.5 0 0 1 1 0V14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h3.5Zm3.8-.96a.5.5 0 0 1 .53.09l5 4.5a.5.5 0 0 1 0 .74l-5 4.5a.5.5 0 0 1-.83-.37V9.34c-1.4.13-2.67.78-3.7 1.6a9.55 9.55 0 0 0-2.2 2.5l-.15.28A.5.5 0 0 1 6 13.5c0-2.05.38-4.28 1.52-6.02A6.57 6.57 0 0 1 13 4.5V2.43a.5.5 0 0 1 .3-.39ZM14 5a.5.5 0 0 1-.5.5c-2.59 0-4.18 1.05-5.14 2.52a8.79 8.79 0 0 0-1.25 3.69 11 11 0 0 1 1.56-1.54 7.8 7.8 0 0 1 4.83-1.85c.28 0 .5.22.5.5v1.56L17.75 7 14 3.62V5Z" />
    </Svg>
  );
};
