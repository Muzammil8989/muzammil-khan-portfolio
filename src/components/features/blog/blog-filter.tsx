"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface BlogFilterProps {
    initialDifficulty?: string;
    initialSearch?: string;
    // kept for API compatibility but not used
    allTags?: string[];
    initialTag?: string;
}

export function BlogFilter({
    initialDifficulty = "all",
    initialSearch = "",
}: BlogFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [searchValue, setSearchValue] = useState(initialSearch);

    const updateFilters = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        // drop tag param since we removed tag filtering
        params.delete("tag");

        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== "all") {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        startTransition(() => {
            router.push(`/blog?${params.toString()}`);
        });
    };

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        const timeoutId = setTimeout(() => {
            updateFilters({ search: value });
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto w-full">
            {/* Search */}
            <div className="relative flex-1 w-full">
                <Search
                    className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${
                        isPending ? "text-indigo-500 animate-pulse" : "text-muted-foreground"
                    }`}
                />
                <Input
                    placeholder="Search articles…"
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 h-11 text-sm"
                />
            </div>

            {/* Difficulty */}
            <Select
                value={initialDifficulty}
                onValueChange={(value) => updateFilters({ difficulty: value })}
            >
                <SelectTrigger className="w-full sm:w-40 h-11 shrink-0">
                    <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
