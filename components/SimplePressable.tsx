// SimplePressable.tsx - Replace HapticPressable
import React from 'react';
import { Pressable, PressableProps } from 'react-native';

interface SimplePressableProps extends PressableProps {
  children: React.ReactNode;
}

export function SimplePressable({ children, style, ...props }: SimplePressableProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}
