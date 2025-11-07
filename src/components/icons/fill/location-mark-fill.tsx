import * as React from "react";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  RadialGradient,
  SvgProps,
} from "react-native-svg";
import { StyleProp, ViewStyle } from "react-native";

interface LocationRippleColorIconProps extends SvgProps {
  size?: number;
  // Note: This component uses fixed gradients, so 'color' prop is not typically used for the fill.
  style?: StyleProp<ViewStyle>;
}

export const LocationRippleColorIcon: React.FC<
  LocationRippleColorIconProps
> = ({
  size = 20, // Original SVG size is 20x20
  style,
  ...props
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none" // Fill is handled by paths referencing gradients
      style={style}
      aria-label="LocationRippleColor"
      role="img"
      {...props}
    >
      <Defs>
        {/* Linear Gradient for the main map marker (b) */}
        <LinearGradient
          id="ripple-linear-b"
          x1="1.38"
          y1="-2"
          x2="11.37"
          y2="13.72"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#F97DBD" />
          <Stop offset="1" stopColor="#D7257D" />
        </LinearGradient>

        {/* Linear Gradient for the center dot (c) */}
        <LinearGradient
          id="ripple-linear-c"
          x1="8.23"
          y1="8.18"
          x2="10.31"
          y2="10.34"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor="#FDFDFD" />
          <Stop offset="1" stopColor="#FECBE6" />
        </LinearGradient>

        {/* Radial Gradient for the bottom ripple/shadow (a) */}
        <RadialGradient
          id="ripple-radial-a"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(10.99996 -1.99998 .85714 4.71428 9.5 15)"
        >
          <Stop offset="0" stopColor="#7B7BFF" />
          <Stop offset=".5" stopColor="#A3A3FF" />
          <Stop offset="1" stopColor="#CEB0FF" />
        </RadialGradient>
      </Defs>

      {/* Path 1: Ripple/Shadow (references ripple-radial-a) */}
      <Path
        d="M17 16c0 2-3.5 3-7 3s-7-1-7-3 3.5-3 7-3 7 1 7 3Z"
        fill="url(#ripple-radial-a)"
      />

      {/* Path 2: Main Map Marker (references ripple-linear-b) */}
      <Path
        d="M10 2a6 6 0 0 0-6 6c0 1.47.84 3 1.8 4.3a23.9 23.9 0 0 0 2.95 3.21c.71.66 1.79.66 2.5 0 .8-.72 1.96-1.89 2.94-3.2C15.16 11 16 9.47 16 8a6 6 0 0 0-6-6Z"
        fill="url(#ripple-linear-b)"
      />

      {/* Path 3: Center Dot (references ripple-linear-c) */}
      <Path
        d="M12 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
        fill="url(#ripple-linear-c)"
      />
    </Svg>
  );
};
