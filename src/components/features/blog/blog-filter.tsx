"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface BlogFilterProps {
    allTags: string[];
    initialDifficulty?: string;
    initialTag?: string;
    initialSearch?: string;
}

export function BlogFilter({
    allTags,
    initialDifficulty = "all",
    initialTag = "",
    initialSearch = ""
}: BlogFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [searchValue, setSearchValue] = useState(initialSearch);

    const updateFilters = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());

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
        // Debounce search update (optional, but good for UX)
        const timeoutId = setTimeout(() => {
            updateFilters({ search: value });
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isPending ? 'text-indigo-500 animate-pulse' : 'text-muted-foreground'}`} />
                <Input
                    placeholder="Search blogs by title, tags, or content..."
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-12 h-12 text-base"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 justify-center">
                <Select
                    value={initialDifficulty}
                    onValueChange={(value) => updateFilters({ difficulty: value })}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                </Select>

                {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <Badge
                            variant={!initialTag ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => updateFilters({ tag: null })}
                        >
                            All
                        </Badge>
                        {allTags.slice(0, 10).map((tag) => (
                            <Badge
                                key={tag}
                                variant={initialTag === tag ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => updateFilters({ tag: tag === initialTag ? null : tag })}
                            >
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
