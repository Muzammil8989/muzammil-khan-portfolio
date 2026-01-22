"use client";

import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignOutButton } from "@/components/features/auth";
import { ModeToggle } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutDashboard, User, Briefcase, GraduationCap, FileText, Code2, Wrench, BookOpen } from "lucide-react";

// Lazy load manager components - No initialProps needed anymore as we use React Query Hydration
const ProfileManager = dynamic(() => import("@/components/features/profile").then(mod => ({ default: mod.ProfileManager })), {
    loading: () => <Skeleton className="h-96 w-full rounded-xl dark:bg-white/10" />,
});
const WorkManager = dynamic(() => import("@/components/features/work").then(mod => ({ default: mod.WorkManager })), {
    loading: () => <Skeleton className="h-96 w-full rounded-xl dark:bg-white/10" />,
});
const EducationManager = dynamic(() => import("@/components/features/education").then(mod => ({ default: mod.EducationManager })), {
    loading: () => <Skeleton className="h-96 w-full rounded-xl dark:bg-white/10" />,
});
const AboutManager = dynamic(() => import("@/components/features/about").then(mod => ({ default: mod.AboutManager })), {
    loading: () => <Skeleton className="h-96 w-full rounded-xl dark:bg-white/10" />,
});
const ProjectManager = dynamic(() => import("@/components/features/projects").then(mod => ({ default: mod.ProjectManager })), {
    loading: () => <Skeleton className="h-96 w-full rounded-xl dark:bg-white/10" />,
});
const SkillsManager = dynamic(() => import("@/components/features/skills").then(mod => ({ default: mod.SkillsManager })), {
    loading: () => <Skeleton className="h-96 w-full rounded-xl dark:bg-white/10" />,
});
const BlogManager = dynamic(() => import("@/components/features/blog").then(mod => ({ default: mod.BlogManager })), {
    loading: () => <Skeleton className="h-96 w-full rounded-xl dark:bg-white/10" />,
});

export function DashboardClient() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
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

                <main className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <Tabs defaultValue="profiles" className="w-full">
                        <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-2">
                            <TabsList className="bg-transparent h-auto p-0 gap-4 sm:gap-6 flex overflow-x-auto no-scrollbar">
                                <TabsTrigger value="profiles" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none px-0 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all whitespace-nowrap">
                                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                    Profiles
                                </TabsTrigger>
                                <TabsTrigger value="work" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none px-0 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all whitespace-nowrap">
                                    <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                    Work
                                </TabsTrigger>
                                <TabsTrigger value="education" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none px-0 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all whitespace-nowrap">
                                    <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                    Education
                                </TabsTrigger>
                                <TabsTrigger value="about" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none px-0 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all whitespace-nowrap">
                                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                    About
                                </TabsTrigger>
                                <TabsTrigger value="projects" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none px-0 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all whitespace-nowrap">
                                    <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                    Projects
                                </TabsTrigger>
                                <TabsTrigger value="skills" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none px-0 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all whitespace-nowrap">
                                    <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                    Skills
                                </TabsTrigger>
                                <TabsTrigger value="blogs" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none px-0 py-2.5 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all whitespace-nowrap">
                                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                                    Blog
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-4 sm:p-6 md:p-8">
                            <TabsContent value="profiles">
                                <ProfileManager />
                            </TabsContent>
                            <TabsContent value="work">
                                <WorkManager />
                            </TabsContent>
                            <TabsContent value="education">
                                <EducationManager />
                            </TabsContent>
                            <TabsContent value="about">
                                <AboutManager />
                            </TabsContent>
                            <TabsContent value="projects">
                                <ProjectManager />
                            </TabsContent>
                            <TabsContent value="skills">
                                <SkillsManager />
                            </TabsContent>
                            <TabsContent value="blogs">
                                <BlogManager />
                            </TabsContent>
                        </div>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}
