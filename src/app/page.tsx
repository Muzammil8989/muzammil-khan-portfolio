"use client";

import { useEffect, useState } from "react";
import { BlurFade } from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfiles } from "@/app/hooks/useProfiles";
import { Skeleton } from "@/components/ui/skeleton";

const BLUR_FADE_DELAY = 0.04;

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
    <main className="flex flex-col min-h-[100dvh] space-y-10 overflow-x-hidden  sm:px-6">
      <section id="hero">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="flex flex-col gap-6">
            {isLoading ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-3/4 rounded-md" />
                  <Skeleton className="h-5 w-full rounded-md" />
                </div>
                <Skeleton className="h-28 w-28 rounded-full self-center sm:self-start" />
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
                    {/* Avatar First on Mobile */}
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

                    {/* Text Second on Mobile */}
                    <div className="flex flex-col flex-1 space-y-2 text-center sm:text-left order-2 sm:order-1">
                      {showAnimated ? (
                        <>
                          {/* First two words in mobile */}
                          <BlurFadeText
                            delay={BLUR_FADE_DELAY}
                            className="font-bold tracking-tight text-[22px] sm:hidden break-words"
                            yOffset={8}
                            text={`Hi, I'm ${mobileName} 👋`}
                          />
                          {/* First word in desktop/tablet */}
                          <BlurFadeText
                            delay={BLUR_FADE_DELAY}
                            className="hidden sm:block font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl break-words"
                            yOffset={8}
                            text={`Hi, I'm ${firstWord} 👋`}
                          />
                          <BlurFadeText
                            delay={BLUR_FADE_DELAY}
                            className="max-w-[600px] text-[16px] sm:text-base md:text-lg text-justify"
                            text={profile.description}
                          />
                        </>
                      ) : (
                        <>
                          <p className="font-bold tracking-tight text-[22px] sm:hidden break-words">
                            Hi, I'm {mobileName} 👋
                          </p>
                          <p className="hidden sm:block font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl break-words">
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
