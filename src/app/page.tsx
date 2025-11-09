"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfiles } from "@/app/hooks/useProfiles";
import { useAbout } from "./hooks/useAbout";
import { useWorkExperiences } from "./hooks/useWorkExperiences";
import { Skeleton } from "@/components/ui/skeleton";
import SplitText from "@/components/react-bit/split-text";
import Particles from "@/components/react-bit/particles";
import BlurText from "@/components/react-bit/blur-text";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ResumeCard } from "@/components/resume-card";
import React from "react";

interface AboutData {
  message: string;
}

const BLUR_FADE_DELAY = 0.08;

export default function Page() {
  // Profiles (Hero)
  const { data: profiles = [], isLoading, isError } = useProfiles();

  // About
  const {
    data: aboutData = { message: "" },
    isLoading: isAboutLoading,
    isError: isAboutError,
  } = useAbout();

  // Work Experiences
  const {
    data: workData = [],
    isLoading: isWorkLoading,
    isError: isWorkError,
  } = useWorkExperiences();

  const aboutMessage =
    (aboutData as AboutData)?.message ||
    "I hold a degree in Computer Science from Bahria University, which gave me a solid foundation for my career as a full-stack engineer. I’m currently applying my skills at Pakistan Agriculture Research (PAR) through a collaboration with the US-based company DPSolutions. I’m passionate about solving real-world problems and focused on building high-quality, reliable software. My work is supported by strong skills in Data Structures and Algorithms, Database Management Systems (DBMS), and Agile development practices.";

  const highlightList = [
    "Computer Science",
    "Bahria University",
    "full-stack engineer",
    "Pakistan Agriculture Research (PAR)",
    "US-based company DPSolutions",
    "real-world problems",
    "high-quality, reliable software",
    "Data Structures and Algorithms",
    "Database Management Systems (DBMS)",
    "Agile development practices",
  ];

  return (
    <main className="relative flex flex-col min-h-[500dvh] space-y-2 overflow-x-hidden px-6 py-6 sm:py-10">
      {/* Background Animation */}
      <div className="fixed inset-0 -z-10">
        <Particles
          particleColors={["#ffffff", "#3624d6", "#FED000", "#c300ffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Hero */}
      <section id="hero" className="pb-4">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <div className="flex flex-col gap-6">
            {isLoading ? (
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="order-1 sm:order-2">
                  <Skeleton className="h-28 w-28 rounded-full" />
                </div>
                <div className="order-2 sm:order-1 flex-1 space-y-4 w-full">
                  <Skeleton className="h-8 w-3/4 sm:hidden mx-auto sm:mx-0" />
                  <Skeleton className="hidden sm:block h-10 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ) : (
              profiles.map((profile) => {
                const words = profile.name?.trim()?.split(" ") || [];
                const firstWord = words[0] || "";
                const secondWord = words[1] || "";
                const mobileName = `${firstWord} ${secondWord}`.trim();

                return (
                  <div
                    key={profile._id?.toString()}
                    className="flex flex-col sm:flex-row sm:justify-between gap-4 items-center sm:items-start"
                  >
                    {/* Avatar */}
                    <div className="order-1 sm:order-2 px-1 sm:px-0">
                      <Avatar className="size-28 sm:size-28 border">
                        <AvatarImage
                          alt={profile.name}
                          src={profile.avatarUrl}
                        />
                        <AvatarFallback>{profile.initials}</AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Text */}
                    <div className="flex flex-col flex-1 space-y-2 order-2 sm:order-1">
                      {/* Mobile Heading */}
                      <div className="block sm:hidden font-bold tracking-tight text-[22px] text-center">
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

                      {/* Desktop Heading */}
                      <div className="hidden sm:block font-bold tracking-tight text-3xl md:text-4xl lg:text-5xl text-left">
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

                      {/* Description */}
                      <BlurText
                        text={profile.description}
                        delay={100}
                        animateBy="words"
                        direction="top"
                        className="max-w-[600px] text-[14px] sm:text-[15px] md:text-[15.5px] leading-relaxed text-justify"
                        stepDuration={0.45}
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

      {/* About */}
      <section id="about">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <div className="flex flex-col gap-6">
            {isAboutLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : isAboutError ? (
              <p className="text-red-500 text-sm text-center sm:text-left">
                Failed to load about data.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="font-bold tracking-tight text-xl text-left">
                  <SplitText
                    text="About Me"
                    delay={100}
                    duration={0.6}
                    ease="power3.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 30 }}
                    to={{ opacity: 1, y: 0 }}
                  />
                </div>

                {/* Animated + emphasized keywords (bold+underline, no bg) */}
                <BlurText
                  text={aboutMessage}
                  delay={100}
                  animateBy="words"
                  direction="top"
                  className="max-w-[600px] text-[14px] sm:text-[15px] md:text-[15.5px] leading-relaxed text-justify"
                  stepDuration={0.45}
                  emphasizeKeywords={highlightList}
                  emphasizeClassName="font-bold underline underline-offset-2 decoration-gray-700"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Work Experience */}
      <section id="work">
        <div className="mx-auto w-full max-w-2xl flex min-h-0 flex-col pt-4">
          <BlurFade delay={BLUR_FADE_DELAY * 5}>
            <h2 className="text-xl font-bold">
              <SplitText
                text="Work Experience"
                delay={60}
                duration={0.55}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 24 }}
                to={{ opacity: 1, y: 0 }}
              />
            </h2>
          </BlurFade>

          {isWorkLoading ? (
            // Work skeletons
            <>
              <div className="flex gap-4 items-start">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </>
          ) : isWorkError ? (
            <p className="text-red-500 text-sm">Failed to load work data.</p>
          ) : workData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No work entries yet.</p>
          ) : (
            workData.map((work: any, id: number) => (
              <BlurFade key={work.company} delay={BLUR_FADE_DELAY * 6 + id * 0.05}>
                <ResumeCard
                  logoUrl={work.logoUrl}
                  altText={work.company}
                  title={work.company}
                  subtitle={work.title}
                  href={work.href}
                  badges={work.badges}
                  period={`${work.start} - ${work.end ?? "Present"}`}
                  description={work.description}
                
                />
              </BlurFade>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
