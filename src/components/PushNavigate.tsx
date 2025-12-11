let navigateFn: (path: string) => void;

export const setNavigator = (navFn: (path: string) => void) => {
  navigateFn = navFn;
};

export const pushNavigate = (path: string) => {
  if (navigateFn) {
    navigateFn(path);
  } else {
    console.warn("Navigator is not set yet");
  }
};
