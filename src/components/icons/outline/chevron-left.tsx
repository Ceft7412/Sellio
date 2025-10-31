import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface ChevronLeftRegularIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const ChevronLeftRegularIcon: React.FC<ChevronLeftRegularIconProps> = ({
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
      aria-label="ChevronLeftRegular"
      role="img"
    >
      <Path
        d="M12.35 4.15a.5.5 0 0 0-.7 0L6.16 9.61a.5.5 0 0 0 0 .78l5.49 5.46a.5.5 0 1 0 .7-.7L7.2 10 12.35 4.85a.5.5 0 0 0 0-.7Z"
      />
    </Svg>
  );
};

interface SendRegularIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const SendRegularIcon: React.FC<SendRegularIconProps> = ({
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
      aria-label="SendRegular"
      role="img"
    >
      <Path
        d="M3.22 2.5a.5.5 0 0 0-.7.58l1.5 5.62a.5.5 0 0 0 .4.36l6.85 1.14c.28.05.28.45 0 .5l-6.85 1.14a.5.5 0 0 0-.4.36l-1.5 5.62a.5.5 0 0 0 .7.58l15-7.5a.5.5 0 0 0 0-.9l-15-7.5ZM3 3.65l13.9 6.95-13.9 6.95L4.47 11.8a.5.5 0 0 0-.32-.48L3 10l1.15-.82a.5.5 0 0 0 .32-.48L3 3.65Z"
      />
    </Svg>
  );
};

interface ImageRegularIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const ImageRegularIcon: React.FC<ImageRegularIconProps> = ({
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
      aria-label="ImageRegular"
      role="img"
    >
      <Path
        d="M14 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0ZM3 6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm3-2a2 2 0 0 0-2 2v8c0 .37.1.72.28 1.02l4.67-4.59a1.5 1.5 0 0 1 2.1 0l4.67 4.59c.18-.3.28-.65.28-1.02V6a2 2 0 0 0-2-2H6Zm0 12h8a2 2 0 0 0 1.01-.27l-4.66-4.58a.5.5 0 0 0-.7 0l-4.66 4.58A2 2 0 0 0 6 16Z"
      />
    </Svg>
  );
};

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