"use client";

import { ReactNode, useEffect } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Force light mode by adding 'light' class to html element
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.colorScheme = 'light';
  }, []);

  return (
    <div className="light" data-theme="light" style={{ colorScheme: 'light' }}>
      {children}
    </div>
  );
}
