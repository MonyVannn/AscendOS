"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TenantContext } from "@/lib/tenant";
import { buildNavSearchIndex, NavSearchItem } from "@/lib/dashboard-search-index";
import { iconMap } from "@/lib/dashboard-icons";
import { Circle, FileText, Search, User, Activity } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Command as CommandPrimitive } from "cmdk";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface DashboardCommandMenuProps {
  tenant: NonNullable<TenantContext>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "dialog" | "inline";
}

export function DashboardCommandMenu({ tenant, open, onOpenChange, variant = "dialog" }: DashboardCommandMenuProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 250);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Platform specific shortcut hint
  const [shortcutPrefix, setShortcutPrefix] = React.useState("⌘");
  React.useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.platform) {
      if (navigator.platform.toLowerCase().includes("win")) {
        setShortcutPrefix("Ctrl");
      }
    }
  }, []);

  const navIndex = React.useMemo(() => buildNavSearchIndex(tenant), [tenant]);

  // Client-side filtering for navigation
  const filteredNav = React.useMemo(() => {
    if (!search) return navIndex.slice(0, 5); // Show top 5 when empty
    const lowerSearch = search.toLowerCase();
    return navIndex.filter(
      (item) =>
        item.label.toLowerCase().includes(lowerSearch) ||
        item.pillar?.toLowerCase().includes(lowerSearch)
    );
  }, [navIndex, search]);

  // Backend search for data entities
  const backendResults = useQuery(
    api.search.globalSearch,
    debouncedSearch.trim() ? { searchQuery: debouncedSearch } : "skip"
  );

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      onOpenChange(false);
      setSearch("");
      command();
    },
    [onOpenChange]
  );

  const hasResults = filteredNav.length > 0 || 
    (backendResults && (backendResults.agents.length > 0 || backendResults.submissions.length > 0 || backendResults.resources.length > 0));

  const CommandContents = (
    <>
      <CommandList>
        {!hasResults && search.trim() !== "" && (
          <div className="py-6 text-center text-sm text-muted-foreground">No results found.</div>
        )}
        
        {filteredNav.length > 0 && (
          <CommandGroup heading="Navigate">
            {filteredNav.map((item) => {
              const Icon = iconMap[item.icon] || Circle;
              return (
                <CommandItem
                  key={item.id}
                  value={`nav-${item.label}`}
                  onSelect={() => {
                    runCommand(() => router.push(item.href));
                  }}
                >
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                  {item.pillar && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {item.pillar}
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {backendResults && backendResults.agents.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Agents">
              {backendResults.agents.map((agent) => (
                <CommandItem
                  key={agent.id}
                  value={`agent-${agent.label}`}
                  onSelect={() => {
                    runCommand(() => router.push(agent.href));
                  }}
                >
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{agent.label}</span>
                    <span className="text-xs text-muted-foreground">{agent.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {backendResults && backendResults.submissions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Submissions">
              {backendResults.submissions.map((sub) => (
                <CommandItem
                  key={sub.id}
                  value={`sub-${sub.label}`}
                  onSelect={() => {
                    runCommand(() => router.push(sub.href));
                  }}
                >
                  <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{sub.label}</span>
                    <span className="text-xs text-muted-foreground">{sub.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {backendResults && backendResults.resources.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Resources">
              {backendResults.resources.map((res) => (
                <CommandItem
                  key={res.id}
                  value={`res-${res.label}`}
                  onSelect={() => {
                    runCommand(() => router.push(res.href));
                  }}
                >
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{res.label}</span>
                    <span className="text-xs text-muted-foreground">{res.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </>
  );

  if (variant === "inline") {
    return (
      <Command shouldFilter={false} className="overflow-visible bg-transparent w-full">
        <Popover open={open} onOpenChange={onOpenChange}>
          <PopoverAnchor asChild>
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <CommandPrimitive.Input
                ref={inputRef}
                value={search}
                onValueChange={setSearch}
                onFocus={() => onOpenChange(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    inputRef.current?.blur();
                    onOpenChange(false);
                  }
                }}
                placeholder="Search forms, agents, submi..."
                className="flex h-10 w-full rounded-md border border-input bg-muted/50 pl-9 pr-12 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none">
                <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">{shortcutPrefix}</span>K
                </kbd>
              </div>
            </div>
          </PopoverAnchor>
          <PopoverContent
            asChild
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (e.target === inputRef.current) e.preventDefault();
            }}
            style={{ width: "var(--radix-popover-trigger-width)" }}
            className="p-0"
            align="start"
          >
            <div className="bg-popover text-popover-foreground shadow-md rounded-md border outline-none max-h-80 overflow-y-auto">
              {CommandContents}
            </div>
          </PopoverContent>
        </Popover>
      </Command>
    );
  }

  return (
    <CommandDialog shouldFilter={false} open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search forms, agents, submissions, resources..." 
        value={search}
        onValueChange={setSearch}
      />
      {CommandContents}
    </CommandDialog>
  );
}
