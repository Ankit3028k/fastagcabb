/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#1ca63a'; // Green
const tintColorDark = '#1ca63a';  // Green

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#7e8689',
    tabIconDefault: '#7e8689',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ffffff',
    background: '#1A1A1A',
    tint: tintColorDark,
    icon: '#7e8689',
    tabIconDefault: '#7e8689',
    tabIconSelected: tintColorDark,
  },
};
