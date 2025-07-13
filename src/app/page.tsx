"use client";

import { useEffect, useState } from "react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfiles } from "@/app/hooks/useProfiles";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const BLUR_FADE_DELAY = 0.04;

// Animation variants for text
const textVariants = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
};

export default function Page() {
  const { data: profiles = [], isLoading, isError } = useProfiles();
  const [showAnimated, setShowAnimated] = useState(true);

  useEffect(() => {
    if (!isLoading && profiles.length > 0) {
      const timeout = setTimeout(() => {
        setShowAnimated(false);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, profiles]);

  return (
    <main className="flex flex-col min-h-[100dvh] space-y-10 overflow-x-hidden sm:px-6">
      <section id="hero">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="flex flex-col gap-6">
            {isLoading ? (
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                {/* Avatar skeleton */}
                <div className="order-1 sm:order-2">
                  <Skeleton className="h-28 w-28 rounded-full" />
                </div>

                {/* Text content skeleton */}
                <div className="order-2 sm:order-1 flex-1 space-y-4 w-full">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-3/4 sm:hidden mx-auto sm:mx-0" />
                    <Skeleton className="hidden sm:block h-10 w-1/2" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            ) : (
              profiles.map((profile) => {
                const words = profile.name.trim().split(" ");
                const firstWord = words[0] || "";
                const secondWord = words[1] || "";
                const mobileName = `${firstWord} ${secondWord}`.trim();

                return (
                  <div
                    key={profile._id.toString()}
                    className="flex flex-col sm:flex-row sm:justify-between gap-4 items-center sm:items-start"
                  >
                    {/* Avatar */}
                    <div className="order-1 sm:order-2 px-1 sm:px-0">
                      {showAnimated ? (
                        <BlurFade delay={BLUR_FADE_DELAY}>
                          <Avatar className="size-28 sm:size-28 border">
                            <AvatarImage
                              alt={profile.name}
                              src={profile.avatarUrl}
                            />
                            <AvatarFallback>{profile.initials}</AvatarFallback>
                          </Avatar>
                        </BlurFade>
                      ) : (
                        <Avatar className="size-28 sm:size-28 border">
                          <AvatarImage
                            alt={profile.name}
                            src={profile.avatarUrl}
                          />
                          <AvatarFallback>{profile.initials}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {/* Text Content */}
                    <div className="flex flex-col flex-1 space-y-2 order-2 sm:order-1">
                      {showAnimated ? (
                        <>
                          {/* Mobile Name */}
                          <motion.p
                            initial="hidden"
                            animate="visible"
                            variants={textVariants}
                            transition={{
                              duration: 0.6,
                              delay: BLUR_FADE_DELAY,
                              ease: "easeOut",
                            }}
                            className="font-bold tracking-tight text-[22px] sm:hidden break-words text-center sm:text-left"
                          >
                            Hi, I'm {mobileName} 👋
                          </motion.p>

                          {/* Desktop Name */}
                          <motion.p
                            initial="hidden"
                            animate="visible"
                            variants={textVariants}
                            transition={{
                              duration: 0.6,
                              delay: BLUR_FADE_DELAY,
                              ease: "easeOut",
                            }}
                            className="hidden sm:block font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl break-words text-center sm:text-left"
                          >
                            Hi, I'm {firstWord} 👋
                          </motion.p>

                          {/* Description */}
                          <motion.p
                            initial="hidden"
                            animate="visible"
                            variants={textVariants}
                            transition={{
                              duration: 0.6,
                              delay: BLUR_FADE_DELAY + 0.1,
                              ease: "easeOut",
                            }}
                            className="max-w-[600px] text-[16px] sm:text-base md:text-lg text-justify"
                          >
                            {profile.description}
                          </motion.p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold tracking-tight text-[22px] sm:hidden break-words text-center sm:text-left">
                            Hi, I'm {mobileName} 👋
                          </p>
                          <p className="hidden sm:block font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl break-words text-center sm:text-left">
                            Hi, I'm {firstWord} 👋
                          </p>
                          <p className="max-w-[600px] text-[16px] sm:text-base md:text-lg text-justify">
                            {profile.description}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            {isError && (
              <p className="text-red-500 text-sm text-center sm:text-left">
                Failed to load profile data.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
