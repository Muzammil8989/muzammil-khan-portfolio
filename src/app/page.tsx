"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfiles } from "@/app/hooks/useProfiles";
import { useAbout } from "@/app/hooks/useAbout";
import { useWorkExperiences } from "@/app/hooks/useWorkExperiences";
import { useEducations } from "@/app/hooks/useEducation";
import { useProjects } from "@/app/hooks/useProjects";
import { useSkills } from "@/app/hooks/useSkills";
import { Skeleton } from "@/components/ui/skeleton";
import { ResumeCard } from "@/components/shared";
import BlurText from "@/components/react-bit/blur-text";
import React from "react";
import { PersonStructuredData } from "@/components/seo/structured-data";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Navbar from "@/components/layout/navbar";

interface AboutData {
  message: string;
}

export default function Page() {
  // Data fetching
  const { data: profiles = [], isLoading: isProfilesLoading } = useProfiles();
  const { data: aboutData = { message: "" }, isLoading: isAboutLoading } = useAbout();
  const { data: workData = [], isLoading: isWorkLoading } = useWorkExperiences();
  const { data: educationData = [], isLoading: isEducationLoading } = useEducations();
  const { data: projectsData = [], isLoading: isProjectsLoading } = useProjects();
  const { data: skillsData = [], isLoading: isSkillsLoading } = useSkills();

  const aboutMessage =
    (aboutData as AboutData)?.message ||
    "I am a dedicated Full Stack Engineer with a BS in Computer Science from Bahria University. Currently shaping the digital landscape at Pakistan Agriculture Research.";

  const highlightList = [
    "BS in Computer Science", "Bahria University", "Full Stack Engineer", "Pakistan Agriculture Research", "high-performance applications", "refined user interfaces"
  ];

  const profile = profiles[0];
  const sameAs = [
    DATA.contact.social.GitHub?.url,
    DATA.contact.social.LinkedIn?.url,
  ].filter(Boolean);

  return (
    <main className="min-h-screen">
      {/* SEO: Structured Data */}
      {profile && (
        <PersonStructuredData
          name={profile.name}
          description={profile.description}
          url={DATA.url}
          image={profile.avatarUrl}
          sameAs={sameAs as string[]}
        />
      )}

      {/* Main Container */}
      <div className="w-full mx-auto px-6 py-20 space-y-20 max-w-7xl">
        {/* Hero Section */}
        <header className="flex flex-col md:flex-row items-center gap-10 w-full">
          {isProfilesLoading ? (
            <>
              <Skeleton className="w-full max-w-[160px] h-40 md:w-48 md:h-48 rounded-full dark:bg-white/10" />
              <div className="flex-1 space-y-4 text-center md:text-left w-full">
                <Skeleton className="h-8 w-48 mx-auto md:mx-0 dark:bg-white/10" />
                <Skeleton className="h-16 w-full max-w-2xl mx-auto md:mx-0 dark:bg-white/10" />
                <Skeleton className="h-6 w-full max-w-xl mx-auto md:mx-0 dark:bg-white/10" />
              </div>
            </>
          ) : (
            profiles.map((profile) => (
              <React.Fragment key={profile._id}>
                <div className="relative w-full md:w-auto flex justify-center md:block">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-200 dark:from-blue-600 dark:to-purple-600 rounded-full blur-3xl opacity-40 dark:opacity-40"></div>
                  <Avatar className="relative w-40 h-40 md:w-48 md:h-48 md:w-56 md:h-56 border-8 border-white dark:border-white/20 object-cover shadow-2xl">
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} className="object-cover" />
                    <AvatarFallback className="text-4xl font-bold bg-indigo-50 dark:bg-blue-900 text-indigo-600 dark:text-blue-300">
                      {profile.initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-center md:text-left space-y-4 w-full flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-blue-500/10 border border-indigo-100 dark:border-blue-400/30 text-indigo-600 dark:text-blue-300 text-xs font-bold uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-blue-400 hidden dark:block"></span>
                    Available for opportunities
                  </div>
                  <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                    Hi, I'm <span className="text-[#FFB902]">{profile.name.replace(' Khan', '')}</span> 👋
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-300 w-full leading-relaxed font-light">
                    Full Stack Web Developer focused on building <span className="text-slate-900 dark:text-white font-medium">scalable web apps</span> with great user experience and strong backend performance.
                  </p>
                </div>
              </React.Fragment>
            ))
          )}
        </header>

        {/* About Section */}
        <section id="about" className="grid md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-1">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-slate-900 dark:text-white sticky top-10">
              About Me
            </h2>
          </div>
          <div className="md:col-span-2 space-y-6">
            {isAboutLoading ? (
              <>
                <Skeleton className="h-5 w-full dark:bg-white/10" />
                <Skeleton className="h-5 w-11/12 dark:bg-white/10" />
                <Skeleton className="h-5 w-5/6 dark:bg-white/10" />
              </>
            ) : (
              <BlurText
                text={aboutMessage}
                delay={200}
                className="text-slate-600 dark:text-slate-200 leading-relaxed text-lg font-light"
                emphasizeKeywords={highlightList}
                emphasizeClassName="font-semibold text-slate-900 dark:text-blue-400 underline decoration-indigo-600 dark:decoration-blue-400 decoration-2 underline-offset-4"
              />
            )}
          </div>
        </section>

        {/* Work Experience Section */}
        <section id="experience" className="grid md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-1">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-slate-900 dark:text-white sticky top-10">
              Work Experience
            </h2>
          </div>
          <div className="md:col-span-2 space-y-8">
            {isWorkLoading ? (
              <>
                <Skeleton className="h-32 w-full rounded-xl dark:bg-white/10" />
                <Skeleton className="h-32 w-full rounded-xl dark:bg-white/10" />
              </>
            ) : (
              workData.map((work: any, index: number) => (
                <div key={work._id} className="relative pl-8 border-l border-slate-200 dark:border-white/20 py-2">
                  <div className={`absolute ${index === 0 ? 'w-3 h-3 bg-indigo-500 dark:bg-blue-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] dark:shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'w-3 h-3 bg-slate-300 dark:bg-slate-600'} rounded-full -left-[6.5px] top-4`}></div>
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
                </div>
              ))
            )}
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="grid md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-1">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-slate-900 dark:text-white sticky top-10">
              Education
            </h2>
          </div>
          <div className="md:col-span-2 space-y-4">
            {isEducationLoading ? (
              <Skeleton className="h-32 w-full rounded-xl dark:bg-white/10" />
            ) : (
              educationData.map((edu: any) => (
                <ResumeCard
                  key={edu._id}
                  href={edu.href}
                  logoUrl={edu.logoUrl}
                  altText={edu.school}
                  title={edu.school}
                  subtitle={edu.degree}
                  period={`${edu.start} - ${edu.end || "Present"}`}
                />
              ))
            )}
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="grid md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-1">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-slate-900 dark:text-white sticky top-10">
              Expertise
            </h2>
          </div>
          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-3">
              {isSkillsLoading ? (
                <>
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-24 rounded-2xl dark:bg-white/10" />
                  ))}
                </>
              ) : (
                skillsData.map((skill: string) => {
                  // Color mapping for different technologies
                  const colorMap: Record<string, string> = {
                    'React.js': 'bg-blue-500',
                    'React': 'bg-blue-500',
                    'Next.js': 'bg-black',
                    'Node.js': 'bg-green-500',
                    'JavaScript': 'bg-yellow-400',
                    'TypeScript': 'bg-blue-400',
                    'Tailwind CSS': 'bg-indigo-500',
                    'Docker': 'bg-orange-500',
                    'Prisma': 'bg-purple-500',
                  };
                  const dotColor = colorMap[skill] || 'bg-slate-500';

                  return (
                    <span
                      key={skill}
                      className="px-5 py-2.5 rounded-2xl bg-white dark:bg-transparent border border-slate-100 dark:border-white/10 shadow-sm text-slate-600 dark:text-white font-medium flex items-center gap-2 hover:shadow-md dark:hover:scale-105 transition-all glass-card"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} dark:shadow-[0_0_10px_currentColor]`}></span>
                      {skill}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Projects Section - Full Width Carousel */}
      <section className="py-32 overflow-hidden" id="projects">
        <div className="w-full max-w-7xl mx-auto px-6 mb-12">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-extrabold text-slate-900 dark:text-white">
            Featured Projects
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-light">Swipe or scroll to explore my latest works</p>
        </div>
        <div className="project-carousel-container relative">
          <div className="flex gap-8 overflow-x-auto px-[calc(50vw-160px)] md:px-[calc(50vw-300px)] lg:px-[calc(50vw-225px)] pb-12 hide-scrollbar snap-x snap-mandatory">
            {isProjectsLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="flex-none w-[320px] md:w-[600px] h-[500px] rounded-[32px] dark:bg-white/10" />
                ))}
              </>
            ) : (
              projectsData.map((project: any) => (
                <div key={project._id} className="flex-none w-[320px] md:w-[600px] snap-center">
                  <div className="relative group h-full">
                    <div className="absolute -inset-4 bg-indigo-500/5 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative overflow-hidden rounded-[32px] border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent shadow-xl h-full flex flex-col">
                      <div className="aspect-video relative overflow-hidden">
                        {project.image && (
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                      <div className="p-8 flex flex-col flex-grow glass-card -mt-12 relative z-10 m-4 rounded-3xl">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{project.title}</h3>
                          <span className="text-xs font-bold text-indigo-600 dark:text-blue-300 bg-indigo-50 dark:bg-blue-500/10 px-2 py-1 rounded">
                            {project.dates}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-300 font-light mb-6 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="mt-auto">
                          <div className="flex flex-wrap gap-2 mb-6">
                            {project.technologies?.slice(0, 3).map((tech: string) => (
                              <span
                                key={tech}
                                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 rounded-lg"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          {project.links && project.links[0] && (
                            <Link
                              href={project.links[0].href || '#'}
                              className="inline-flex items-center gap-2 text-indigo-600 dark:text-blue-400 font-bold group/link hover:gap-3 transition-all"
                            >
                              Visit Website
                              <span className="text-lg group-hover/link:translate-x-1 transition-transform">→</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Navigation Dock */}
      <Navbar />

      {/* Footer */}
      <footer className="text-center py-20 border-t border-slate-100 dark:border-white/10 dark:bg-black/10">
        <p className="text-slate-400 dark:text-slate-400 font-light text-sm">
          © {new Date().getFullYear()} {profile?.name?.replace(' Khan', '') || 'Muhammad Muzammil'} • Built with precision.
        </p>
      </footer>
    </main>
  );
}
