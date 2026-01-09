"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfiles } from "@/app/hooks/useProfiles";
import { useAbout } from "@/app/hooks/useAbout";
import { useWorkExperiences } from "@/app/hooks/useWorkExperiences";
import { useEducations } from "@/app/hooks/useEducation";
import { useProjects } from "@/app/hooks/useProjects";
import { useSkills } from "@/app/hooks/useSkills";
import { Skeleton } from "@/components/ui/skeleton";
import SplitText from "@/components/react-bit/split-text";
import Particles from "@/components/react-bit/particles";
import BlurText from "@/components/react-bit/blur-text";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/magicui/blur-fade";
import { ResumeCard } from "@/components/shared";
import { ProjectCardPublic } from "@/components/features/projects";
import { Icons } from "@/components/shared";
import React, { useEffect, useState } from "react";

interface AboutData {
  message: string;
}

const BLUR_FADE_DELAY = 0.08;

export default function Page() {
  // Dark mode detection
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Data fetching
  const { data: profiles = [], isLoading: isProfilesLoading } = useProfiles();
  const { data: aboutData = { message: "" }, isLoading: isAboutLoading } = useAbout();
  const { data: workData = [], isLoading: isWorkLoading } = useWorkExperiences();
  const { data: educationData = [], isLoading: isEducationLoading } = useEducations();
  const { data: projectsData = [], isLoading: isProjectsLoading } = useProjects();
  const { data: skillsData = [], isLoading: isSkillsLoading } = useSkills();

  const aboutMessage =
    (aboutData as AboutData)?.message ||
    "I hold a degree in Computer Science from Bahria University, which gave me a solid foundation for my career as a full-stack engineer. I’m currently applying my skills at Pakistan Agriculture Research (PAR) through a collaboration with the US-based company DPSolutions. I’m passionate about solving real-world problems and focused on building high-quality, reliable software. My work is supported by strong skills in Data Structures and Algorithms, Database Management Systems (DBMS), and Agile development practices.";

  const highlightList = [
    "BS in Computer Science", "Bahria University", "Full-stack engineer", "Pakistan Agriculture Research (PAR)", "DPSolutions (USA)", "Turn Figma designs into live apps", "Fast, reliable web apps", "Clean code", "Smooth UX", "Ships useful features", "Solves real-world problems", "End-to-end development", "Performance-focused", "Production-ready"
  ];

  return (
    <main className="relative flex flex-col min-h-screen overflow-x-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 -z-10">
        <Particles
          particleColors={isDarkMode ? ["#1a0f2e", "#0f1a2e", "#2e0f1a", "#0f2e2e"] : ["#c8b6ff", "#b3e5ff", "#ffb3e6", "#b3d9ff"]}
          particleCount={180}
          particleSpread={12}
          speed={0.12}
          particleBaseSize={110}
          moveParticlesOnHover={true}
        />
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-6 sm:py-10 lg:py-12 space-y-10 sm:space-y-14 lg:space-y-16">
        {/* Hero Section */}
        <section id="hero" className="w-full">
          {isProfilesLoading ? (
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start text-center sm:text-left">
              <Skeleton className="h-28 w-28 sm:h-32 sm:w-32 rounded-full" />
              <div className="flex-1 space-y-4 w-full">
                <Skeleton className="h-12 w-3/4 mx-auto sm:mx-0" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6 mx-auto sm:mx-0" />
              </div>
            </div>
          ) : (
            profiles.map((profile) => (
              <div key={profile._id} className="flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-10 items-center sm:items-start text-center sm:text-left">
                <BlurFade delay={BLUR_FADE_DELAY}>
                  <Avatar className="size-28 sm:size-32 lg:size-36 border-4 border-primary/20 bg-background shadow-2xl ring-2 ring-background">
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} className="object-cover" />
                    <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-muted">{profile.initials}</AvatarFallback>
                  </Avatar>
                </BlurFade>
                <div className="flex flex-col flex-1 space-y-4 sm:space-y-5 w-full">
                  <h1 className="font-bold tracking-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight break-words">
                    <SplitText
                      text={`Hi, I'm ${profile.name} 👋`}
                      delay={80}
                      duration={0.6}
                      splitType="chars"
                    />
                  </h1>
                  <BlurText
                    text={profile.description}
                    delay={100}
                    className="max-w-3xl text-base sm:text-lg lg:text-xl text-foreground/85 leading-relaxed font-normal"
                  />
                </div>
              </div>
            ))
          )}
        </section>

        {/* About Section */}
        <section id="about" className="w-full">
          <div className="space-y-4 sm:space-y-5">
            <BlurFade delay={BLUR_FADE_DELAY * 2}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">About Me</h2>
            </BlurFade>
            {isAboutLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-11/12" />
                <Skeleton className="h-5 w-5/6" />
              </div>
            ) : (
              <BlurText
                text={aboutMessage}
                delay={200}
                className="max-w-4xl text-base sm:text-lg text-foreground/85 leading-relaxed"
                emphasizeKeywords={highlightList}
                emphasizeClassName="font-bold text-foreground underline decoration-2 underline-offset-4"
              />
            )}
          </div>
        </section>

        {/* Work Section */}
        <section id="work" className="w-full">
          <div className="space-y-4 sm:space-y-5">
            <BlurFade delay={BLUR_FADE_DELAY * 3}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Work Experience</h2>
            </BlurFade>
            <div className="flex flex-col gap-3 sm:gap-4">
              {isWorkLoading ? (
                [...Array(2)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
              ) : (
                workData.map((work: any, id: number) => (
                  <BlurFade key={work._id} delay={BLUR_FADE_DELAY * 4 + id * 0.05}>
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
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="w-full">
          <div className="space-y-4 sm:space-y-5">
            <BlurFade delay={BLUR_FADE_DELAY * 4.5}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Education</h2>
            </BlurFade>
            <div className="flex flex-col gap-3 sm:gap-4">
              {isEducationLoading ? (
                [...Array(2)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
              ) : (
                educationData.map((edu: any, id: number) => (
                  <BlurFade key={edu._id} delay={BLUR_FADE_DELAY * 5 + id * 0.05}>
                    <ResumeCard
                      href={edu.href}
                      logoUrl={edu.logoUrl}
                      altText={edu.school}
                      title={edu.school}
                      subtitle={edu.degree}
                      period={`${edu.start} - ${edu.end || "Present"}`}
                    />
                  </BlurFade>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="w-full">
          <div className="space-y-4 sm:space-y-5">
            <BlurFade delay={BLUR_FADE_DELAY * 6}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Skills & Technologies</h2>
            </BlurFade>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {isSkillsLoading ? (
                [...Array(12)].map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-full" />)
              ) : (
                skillsData.map((skill: string, idx: number) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-medium hover:bg-primary hover:text-primary-foreground transition-all cursor-default"
                  >
                    {skill}
                  </Badge>
                ))
              )}
              {skillsData.length === 0 && !isSkillsLoading && (
                <p className="text-muted-foreground text-sm sm:text-base italic">No skills listed yet.</p>
              )}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="w-full pb-12">
          <div className="space-y-4 sm:space-y-5">
            <BlurFade delay={BLUR_FADE_DELAY * 7}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Featured Projects</h2>
            </BlurFade>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
              {isProjectsLoading ? (
                [...Array(6)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)
              ) : (
                projectsData.map((project: any, id: number) => (
                  <BlurFade key={project._id} delay={BLUR_FADE_DELAY * 8 + id * 0.05}>
                    <ProjectCardPublic
                      title={project.title}
                      href={project.href}
                      description={project.description}
                      dates={project.dates}
                      tags={project.technologies}
                      image={project.image}
                      video={project.video}
                      links={project.links?.map((l: any) => ({
                        type: l.type,
                        href: l.href,
                        icon: l.type.toLowerCase().includes("github") || l.type.toLowerCase().includes("source") ? <Icons.github className="size-3" /> : <Icons.globe className="size-3" />
                      }))}
                    />
                  </BlurFade>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

