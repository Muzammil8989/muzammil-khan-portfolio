import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileService } from "@/services/profile-service";
import { AboutService } from "@/services/about-service";
import { WorkService } from "@/services/work-service";
import { EducationService } from "@/services/education-service";
import { ProjectService } from "@/services/project-service";
import { SkillService } from "@/services/skill-service";
import { ResumeCard } from "@/components/shared";
import BlurText from "@/components/react-bit/blur-text";
import React from "react";
import { PersonStructuredData } from "@/components/seo/structured-data";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/navbar";
import { ContactSection } from "@/components/features/contact/contact-section";

export const dynamic = "force-dynamic";

interface AboutData {
  message: string;
}

export default async function Page() {
  // Direct server-side data fetching
  const [profiles, aboutData, workData, educationData, projectsData, skillsData] = await Promise.all([
    ProfileService.getAll(),
    AboutService.get(),
    WorkService.getAll(),
    EducationService.getAll(),
    ProjectService.getAll(),
    SkillService.getSkillsList()
  ]);

  const aboutMessage =
    (aboutData as any)?.message ||
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
    <main className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Background Decorative Elements */}
      <div className="gradient-decorative-bg"></div>

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
      <div className="relative z-10 w-full mx-auto px-6 py-20 space-y-20 max-w-7xl">
        {/* Hero Section */}
        <header className="flex flex-col md:flex-row items-center gap-10 w-full">
          {profiles.map((profile: any) => (
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest" style={{
                  backgroundColor: 'var(--surface-overlay)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--color-brand-primary)'
                }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-brand-primary)' }}></span>
                  Available for opportunities
                </div>
                <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]" style={{ color: 'var(--text-primary)' }}>
                  Hi, I'm <span style={{ color: 'var(--color-brand-accent)' }}>{profile.name.replace(' Khan', '')}</span> 👋
                </h1>
                <p className="text-xl sm:text-2xl w-full leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
                  Full Stack Web Developer focused on building <span className="font-medium" style={{ color: 'var(--text-primary)' }}>scalable web apps</span> with great user experience and strong backend performance.
                </p>
              </div>
            </React.Fragment>
          ))}
        </header>

        {/* About Section */}
        <section id="about" className="grid md:grid-cols-3 gap-12 items-start scroll-mt-20">
          <div className="md:col-span-1">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-slate-900 dark:text-white sticky top-10">
              About Me
            </h2>
          </div>
          <div className="md:col-span-2 space-y-6">
            <BlurText
              text={aboutMessage}
              delay={200}
              className="text-slate-600 dark:text-slate-200 leading-relaxed text-lg font-light"
              emphasizeKeywords={highlightList}
              emphasizeClassName="font-semibold text-slate-900 dark:text-blue-400 underline decoration-indigo-600 dark:decoration-blue-400 decoration-2 underline-offset-4"
            />
          </div>
        </section>

        {/* Work Experience Section */}
        <section id="experience" className="grid md:grid-cols-3 gap-12 items-start scroll-mt-20">
          <div className="md:col-span-1">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-slate-900 dark:text-white sticky top-10">
              Work Experience
            </h2>
          </div>
          <div className="md:col-span-2 space-y-8">
            {workData.map((work: any, index: number) => (
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
            ))}
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="grid md:grid-cols-3 gap-12 items-start scroll-mt-20">
          <div className="md:col-span-1">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-slate-900 dark:text-white sticky top-10">
              Education
            </h2>
          </div>
          <div className="md:col-span-2 space-y-4">
            {educationData.map((edu: any) => (
              <ResumeCard
                key={edu._id}
                href={edu.href}
                logoUrl={edu.logoUrl}
                altText={edu.school}
                title={edu.school}
                subtitle={edu.degree}
                period={`${edu.start} - ${edu.end || "Present"}`}
              />
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="grid md:grid-cols-3 gap-12 items-start scroll-mt-20">
          <div className="md:col-span-1">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-slate-900 dark:text-white sticky top-10">
              Expertise
            </h2>
          </div>
          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-3">
              {skillsData.map((skill: string) => {
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
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Projects Section - Full Width Carousel */}
      <section className="py-32 overflow-hidden scroll-mt-20" id="projects">
        <div className="w-full max-w-7xl mx-auto px-6 mb-12">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-slate-900 dark:text-white">
            Featured Projects
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-light">Swipe or scroll to explore my latest works</p>
        </div>
        <div className="project-carousel-container relative">
          <div className="flex gap-6 overflow-x-auto px-[calc(50vw-140px)] md:px-[calc(50vw-220px)] lg:px-[calc(50vw-180px)] pb-12 hide-scrollbar snap-x snap-mandatory">
            {projectsData.map((project: any) => (
              <div key={project._id} className="flex-none w-[280px] md:w-[440px] snap-center">
                <div className="relative group h-full">
                  <div className="absolute -inset-3 bg-indigo-500/5 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative overflow-hidden rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent shadow-xl h-full flex flex-col">
                    <div className="aspect-video relative overflow-hidden">
                      {project.image && (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 280px, 440px"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-5 md:p-6 flex flex-col flex-grow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl -mt-8 relative z-10 m-3 rounded-2xl border border-white/40 dark:border-white/10 shadow-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{project.title}</h3>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 tabular-nums ml-2 flex-shrink-0">
                          {project.dates}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                      <div className="mt-auto">
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.technologies?.slice(0, 3).map((tech: string) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {/* Primary Link: Project URL or GitHub */}
                          {(project.projectUrl || project.githubUrl) && (
                            <Link
                              href={project.projectUrl || project.githubUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 font-bold group/link hover:gap-2 transition-all"
                            >
                              {project.projectUrl ? (
                                <>
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  Live Demo
                                </>
                              ) : (
                                <>
                                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                  </svg>
                                  GitHub
                                </>
                              )}
                            </Link>
                          )}
                          {/* Case Study Link */}
                          {project.caseStudyUrl && (
                            <Link
                              href={project.caseStudyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-purple-400 font-bold group/case hover:gap-2 transition-all"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Case Study
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

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
