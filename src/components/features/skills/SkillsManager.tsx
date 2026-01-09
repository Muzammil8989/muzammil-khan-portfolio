"use client";

import { useState, useEffect } from "react";
import { Plus, X, Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSkills, useUpdateSkills } from "@/app/hooks/useSkills";
import { Badge } from "@/components/ui/badge";

export function SkillsManager() {
    const { data: initialSkills = [], isLoading } = useSkills();
    const updateSkills = useUpdateSkills();
    const [skills, setSkills] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (initialSkills) {
            setSkills(initialSkills);
        }
    }, [initialSkills]);

    const addSkill = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !skills.includes(trimmed)) {
            setSkills((prev) => [...prev, trimmed]);
            setInputValue("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setSkills((prev) => prev.filter((s) => s !== skillToRemove));
    };

    const handleSave = () => {
        updateSkills.mutate(skills);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="flex flex-wrap gap-2">
                    {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white/50 p-6 rounded-2xl border border-gray-100 backdrop-blur-sm space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <Sparkles className="size-5 text-blue-500" />
                        Tech Stack & Skills
                    </h2>
                    <p className="text-sm text-gray-500">Manage the technologies you use. Press Enter to add a skill.</p>
                </div>

                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                        placeholder="Add a skill (e.g. Docker, Rust, GSAP)"
                        className="flex-1"
                    />
                    <Button onClick={addSkill} variant="secondary">
                        <Plus className="size-4" />
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 min-h-[100px] items-start transition-all">
                    {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1.5 text-sm gap-1 group bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 font-medium">
                            {skill}
                            <button
                                onClick={() => removeSkill(skill)}
                                className="ml-1 p-0.5 rounded-full hover:bg-slate-300 transition-colors"
                            >
                                <X className="size-3 text-slate-400 group-hover:text-slate-600" />
                            </button>
                        </Badge>
                    ))}
                    {skills.length === 0 && (
                        <p className="text-sm text-slate-400 italic py-4">No skills added yet. Type above to start.</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={updateSkills.isPending || JSON.stringify(skills) === JSON.stringify(initialSkills)}
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 min-w-[140px]"
                >
                    {updateSkills.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
