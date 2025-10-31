import * as React from "react";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  SvgProps,
} from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface StarColorIconProps extends SvgProps {
  size?: number;
  // Note: The 'color' prop is not used here because the icon uses a fixed gradient fill.
  style?: StyleProp<ViewStyle>;
}

export const StarColorIcon: React.FC<StarColorIconProps> = ({
  size = 20, // Original SVG size is 20x20
  style,
  ...props
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      style={style}
      aria-label="StarColor"
      role="img"
      {...props}
    >
      <Defs>
        <LinearGradient
          id="star-gradient" // Assign a clear ID
          x1="18"
          y1="18"
          x2="1.55"
          y2="2.48"
          gradientUnits="userSpaceOnUse"
        >
          {/* Note: In React Native SVG, gradient stops are defined via <Stop> components */}
          <Stop offset="0" stopColor="#FF6F47" />
          <Stop offset="1" stopColor="#FFCD0F" />
        </LinearGradient>
      </Defs>
      <Path
        d="M9.1 2.9a1 1 0 0 1 1.8 0l1.93 3.91 4.31.63a1 1 0 0 1 .56 1.7l-3.12 3.05.73 4.3a1 1 0 0 1-1.45 1.05L10 15.51l-3.86 2.03a1 1 0 0 1-1.45-1.05l.74-4.3L2.3 9.14a1 1 0 0 1 .56-1.7l4.31-.63L9.1 2.9Z"
        // Reference the ID from the <LinearGradient> in the fill attribute
        fill="url(#star-gradient)"
      />
    </Svg>
  );
};
