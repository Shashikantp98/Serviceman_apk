import { useEffect, useState } from "react";

export default function useHeaderMinimize(threshold = 80) {
  const [isHeaderMinimized, setIsHeaderMinimized] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderMinimized(window.scrollY > threshold);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isHeaderMinimized;
}
