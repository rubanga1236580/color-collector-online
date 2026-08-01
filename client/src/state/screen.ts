export type Screen = 'home' | 'gacha' | 'map' | 'encyclopedia';

export let currentScreen: Screen = 'home';

export function setCurrentScreen(screen: Screen) {
  currentScreen = screen;
}

export function getCurrentScreen() {
  return currentScreen;
}
