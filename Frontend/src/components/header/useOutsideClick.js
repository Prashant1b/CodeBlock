import { useEffect, useRef } from "react";

export default function useOutsideClick(onOutside) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onOutside?.();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);

  return ref;
}
