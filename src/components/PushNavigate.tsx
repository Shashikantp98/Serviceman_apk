let navigateFn: (path: string) => void;
let pendingPath: string | null = null;

export const setNavigator = (navFn: (path: string) => void) => {
  navigateFn = navFn;
  // Replay any navigation that was requested before the navigator was ready
  if (pendingPath) {
    console.log("[PushNavigate] Replaying pending navigation to:", pendingPath);
    const path = pendingPath;
    pendingPath = null;
    // Small delay to let React finish mounting routes
    setTimeout(() => navFn(path), 300);
  }
};

export const pushNavigate = (path: string) => {
  if (navigateFn) {
    navigateFn(path);
  } else {
    console.warn("[PushNavigate] Navigator not ready yet — queuing:", path);
    pendingPath = path;
  }
};
