import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface DocumentTextRegularIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const DocumentTextRegularIcon: React.FC<
  DocumentTextRegularIconProps
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
      aria-label="DocumentTextRegular"
      role="img"
    >
      <Path d="M6.5 10a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7Zm0 2a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7Zm0 2a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7ZM4 4c0-1.1.9-2 2-2h4.59c.4 0 .78.16 1.06.44l3.91 3.91c.28.28.44.67.44 1.06V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8h-3.5A1.5 1.5 0 0 1 10 6.5V3H6Zm5.5 4h3.3L11 3.2v3.3c0 .28.22.5.5.5Z" />
    </Svg>
  );
};
