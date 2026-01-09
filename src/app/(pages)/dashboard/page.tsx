"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignOutButton } from "@/components/features/auth";
import { ProfileManager } from "@/components/features/profile";
import { WorkManager } from "@/components/features/work";
import { EducationManager } from "@/components/features/education";
import { AboutManager } from "@/components/features/about";
import { ProjectManager } from "@/components/features/projects";
import { SkillsManager } from "@/components/features/skills";
import { ModeToggle } from "@/components/shared";
import { LayoutDashboard, User, Briefcase, GraduationCap, FileText, Code2, Wrench } from "lucide-react";

export default function DashboardManager() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 dark:bg-blue-500 rounded-xl text-white shadow-lg">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Manage your portfolio content</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <SignOutButton />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <Tabs defaultValue="profiles" className="w-full">
            <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-2">
              <TabsList className="bg-transparent h-auto p-0 gap-4 sm:gap-6 flex overflow-x-auto no-scrollbar">
                <TabsTrigger
                  value="profiles"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none px-0 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all whitespace-nowrap"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                  Profiles
                </TabsTrigger>
                <TabsTrigger
                  value="work"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none px-0 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all whitespace-nowrap"
                >
                  <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                  Work
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none px-0 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all whitespace-nowrap"
                >
                  <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                  Education
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none px-0 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none px-0 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all whitespace-nowrap"
                >
                  <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none px-0 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all whitespace-nowrap"
                >
                  <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                  Skills
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              <TabsContent value="profiles" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <ProfileManager />
              </TabsContent>
              <TabsContent value="work" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <WorkManager />
              </TabsContent>
              <TabsContent value="education" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <EducationManager />
              </TabsContent>
              <TabsContent value="about" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <AboutManager />
              </TabsContent>
              <TabsContent value="projects" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <ProjectManager />
              </TabsContent>
              <TabsContent value="skills" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <SkillsManager />
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
