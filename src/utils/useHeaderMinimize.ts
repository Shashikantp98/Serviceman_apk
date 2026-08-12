import { useEffect, useState } from "react";

export default function useHeaderMinimize(threshold = 80) {
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);

  useEffect(() => {
    const minimizeAt = threshold;
    const expandAt = Math.max(0, threshold - 40);
    let ticking = false;

    const updateHeaderState = () => {
      const scrollY = window.scrollY;

      setIsHeaderMinimized((previous) => {
        if (!previous && scrollY > minimizeAt) {
          return true;
        }

        if (previous && scrollY < expandAt) {
          return false;
        }

        return previous;
      });

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeaderState);
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isHeaderMinimized;
}
