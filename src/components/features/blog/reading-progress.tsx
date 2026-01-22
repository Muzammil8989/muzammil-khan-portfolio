"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar() {
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
        const updateReadingProgress = () => {
            const currentProgress = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight) {
                setReadingProgress(
                    Number((currentProgress / scrollHeight).toFixed(2)) * 100
                );
            }
        };

        window.addEventListener("scroll", updateReadingProgress);
        return () => window.removeEventListener("scroll", updateReadingProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
            <div
                className="h-full bg-[#FFB902] transition-all duration-150 ease-out shadow-[0_0_10px_#FFB902]"
                style={{ width: `${readingProgress}%` }}
            />
        </div>
    );
}
