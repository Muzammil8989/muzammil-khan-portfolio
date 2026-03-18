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
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { ContactSection } from "@/components/features/contact/contact-section";
import { SkillBadges } from "@/components/features/skills/SkillBadges";
import { ProjectCarousel } from "@/components/features/projects/ProjectCarousel";

export const dynamic = "force-dynamic";


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
    "I hold a BS in Computer Science from Bahria University and work as a Full Stack Developer at Pakistan Agriculture Research (PAR) with DPSolutions (USA). I turn Figma designs and ideas into fast, reliable web apps. Focused on building scalable web apps with great user experience and strong backend performance. I specialize in creating seamless automations that optimize workflows and enhance system efficiency.";

  const highlightList = [
    "BS in Computer Science", "Bahria University", "Full Stack Developer", "Pakistan Agriculture Research", "DPSolutions", "scalable web apps", "seamless automations", "optimize workflows", "system efficiency", "great user experience", "strong backend performance"
  ];

  const profile = profiles[0];
  const sameAs = [
    DATA.contact.social.GitHub?.url,
    DATA.contact.social.LinkedIn?.url,
  ].filter(Boolean);

  return (
    <main className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Background Decorative Elements */}
      <div className="gradient-decorative-bg"></div>

      {/* SEO: Structured Data */}
      {profile && (
        <PersonStructuredData
          name={profile.name}
          description={profile.description}
          url={DATA.url}
          image={profile.avatarUrl ?? undefined}
          sameAs={sameAs as string[]}
        />
      )}

      {/* Main Container */}
      <div className="relative z-10 w-full mx-auto px-6 py-12 space-y-14 max-w-5xl">
        {/* Hero Section */}
        <header className="flex flex-col md:flex-row items-center gap-8 md:gap-10 w-full">
          {profiles.map((profile: any) => (
            <React.Fragment key={profile._id}>
              <div className="relative shrink-0 flex justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-blue-200 dark:from-blue-600 dark:to-indigo-700 rounded-full blur-3xl opacity-40 dark:opacity-40"></div>
                <Avatar className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-44 md:h-44 border-4 border-white dark:border-white/20 object-cover shadow-2xl">
                  <AvatarImage src={profile.avatarUrl} alt={profile.name} className="object-cover" />
                  <AvatarFallback className="text-4xl font-bold bg-indigo-50 dark:bg-blue-900 text-indigo-600 dark:text-blue-300">
                    {profile.initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-4 w-full flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest" style={{
                  backgroundColor: 'var(--surface-overlay)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--color-brand-primary)'
                }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-brand-primary)' }}></span>
                  Available for opportunities
                </div>
                <h1 className="font-[family-name:var(--font-display)] font-extrabold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
                  <span className="text-2xl sm:text-3xl md:text-4xl block">Hi, I'm 👋</span>
                  <span className="text-2xl sm:text-4xl md:text-5xl whitespace-nowrap block" style={{ color: 'var(--color-brand-accent)' }}>{profile.name.replace(' Khan', '')}</span>
                </h1>
                <p className="text-base sm:text-lg w-full leading-relaxed font-light" style={{ color: 'var(--text-secondary)', textAlign: 'justify', textAlignLast: 'left', textJustify: 'inter-character', hyphens: 'none', wordBreak: 'normal', overflowWrap: 'normal' }}>
                  {profile.description}
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
              className="text-slate-600 dark:text-slate-200 leading-relaxed text-base font-light"
              emphasizeKeywords={highlightList}
              emphasizeClassName="font-semibold text-[#FFB902] decoration-[#FFB902] underline decoration-2 underline-offset-4"
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
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            {workData.map((work: any, index: number) => (
              <div key={work._id} className="relative pl-4 sm:pl-8 border-l border-slate-200 dark:border-white/20 py-1 sm:py-2">
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
            <SkillBadges skills={skillsData} />
          </div>
        </section>
      </div>

      {/* Projects Section - Carousel */}
      <section className="py-16 scroll-mt-20" id="projects">
        <div className="w-full max-w-5xl mx-auto px-6 mb-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Featured Projects
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400 font-light">
            Click the side cards or use arrows to navigate
          </p>
        </div>
        <ProjectCarousel projects={projectsData} />
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* Navigation Dock */}
      <Navbar />

      <Footer />
    </main>
  );
}
