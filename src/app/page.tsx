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
          <div className="flex gap-8 overflow-x-auto px-[calc(50vw-160px)] md:px-[calc(50vw-300px)] lg:px-[calc(50vw-225px)] pb-12 hide-scrollbar snap-x snap-mandatory">
            {projectsData.map((project: any) => (
              <div key={project._id} className="flex-none w-[320px] md:w-[600px] snap-center">
                <div className="relative group h-full">
                  <div className="absolute -inset-4 bg-indigo-500/5 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative overflow-hidden rounded-[32px] border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent shadow-xl h-full flex flex-col">
                    <div className="aspect-video relative overflow-hidden">
                      {project.image && (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 320px, 600px"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-8 flex flex-col flex-grow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl -mt-12 relative z-10 m-4 rounded-3xl border border-white/40 dark:border-white/10 shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{project.title}</h3>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 tabular-nums">
                          {project.dates}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mb-6 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                      <div className="mt-auto">
                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.technologies?.slice(0, 3).map((tech: string) => (
                            <span
                              key={tech}
                              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        {project.links && project.links[0] && (
                          <Link
                            href={project.links[0].href || '#'}
                            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold group/link hover:gap-3 transition-all"
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
            ))}
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
