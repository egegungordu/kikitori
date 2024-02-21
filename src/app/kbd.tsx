"use client";

import { useEffect, useState } from "react";

export default function Kbd({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

  }, []);

  if (isMobile) {
    return null
  }

  return <kbd className="bg-gradient-to-t from-gray-300 to-white border text-neutral-700 border-neutral-400 shadow-sm shadow-neutral-400 font-semibold text-2xs rounded-md px-2">{children}</kbd>;
}
