"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfiles } from "@/app/hooks/useProfiles";
import { Skeleton } from "@/components/ui/skeleton";
import SplitText from "@/components/react-bit/split-text";
import BlurText from "@/components/react-bit/blur-text";
import Particles from "@/components/react-bit/particles";

export default function Page() {
  const { data: profiles = [], isLoading, isError } = useProfiles();

  return (
    <main className="relative flex flex-col min-h-[100dvh] space-y-10 overflow-x-hidden px-6 py-12 sm:py-20">
      {/* ✅ Animated Background Layer */}
      <div className="fixed inset-0 -z-10">
        <Particles
          particleColors={['#ffffff', '#3624d6', '#FED000', '#c300ffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <section id="hero">
        <div className="mx-auto w-full max-w-2xl space-y-8">
          <div className="flex flex-col gap-6">
            {isLoading ? (
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                {/* Avatar skeleton */}
                <div className="order-1 sm:order-2">
                  <Skeleton className="h-28 w-28 rounded-full" />
                </div>

                {/* Text skeleton */}
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
                      <Avatar className="size-28 sm:size-28 border">
                        <AvatarImage alt={profile.name} src={profile.avatarUrl} />
                        <AvatarFallback>{profile.initials}</AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Text Content */}
                    <div className="flex flex-col flex-1 space-y-2 order-2 sm:order-1">
                      {/* Mobile Name (below sm) */}
                      <div className="block sm:hidden font-bold tracking-tight text-[22px] break-words text-center">
                        <SplitText
                          text={`Hi, I'm ${mobileName} 👋`}
                          delay={80}
                          duration={0.6}
                          ease="power3.out"
                          splitType="chars"
                          from={{ opacity: 0, y: 30 }}
                          to={{ opacity: 1, y: 0 }}
                        />
                      </div>

                      {/* Desktop Name (sm and above) */}
                      <div className="hidden sm:block font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl break-words text-left">
                        <SplitText
                          text={`Hi, I'm ${firstWord} 👋`}
                          delay={100}
                          duration={0.6}
                          ease="power3.out"
                          splitType="chars"
                          from={{ opacity: 0, y: 40 }}
                          to={{ opacity: 1, y: 0 }}
                        />
                      </div>

                      {/* Description (using BlurText) */}
                      <BlurText
                        text={profile.description}
                        delay={100}
                        animateBy="words"
                        direction="top"
                        className="max-w-[600px] text-[16px] sm:text-base md:text-lg text-justify"
                        stepDuration={0.5}
                      />
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
