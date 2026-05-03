import * as React from "react";
import { RefreshCcw, Search, CheckCircle2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  _id: string;
  clerkId: string;
  email?: string;
  name?: string;
  createdAt?: number;
}

interface AssignUserListProps {
  users: User[];
  selectedUserId: string;
  onSelectUser: (id: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function AssignUserList({
  users,
  selectedUserId,
  onSelectUser,
  onRefresh,
  isRefreshing,
}: AssignUserListProps) {
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<"recent" | "name">("recent");

  // Platform specific shortcut hint
  const [shortcutPrefix, setShortcutPrefix] = React.useState("⌘");
  React.useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.platform) {
      if (navigator.platform.toLowerCase().includes("win")) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShortcutPrefix("Ctrl");
      }
    }
  }, []);

  const filteredUsers = React.useMemo(() => {
    let filtered = [...users];
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(u => 
        (u.name && u.name.toLowerCase().includes(lowerSearch)) ||
        (u.email && u.email.toLowerCase().includes(lowerSearch)) ||
        u.clerkId.toLowerCase().includes(lowerSearch)
      );
    }

    filtered.sort((a, b) => {
      if (sort === "name") {
        const nameA = a.name || "";
        const nameB = b.name || "";
        return nameA.localeCompare(nameB);
      } else {
        // recent
        const timeA = a.createdAt || 0;
        const timeB = b.createdAt || 0;
        return timeB - timeA;
      }
    });

    return filtered;
  }, [users, search, sort]);

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">Awaiting Assignment</h2>
          <span className="text-sm text-zinc-500 font-medium">{users.length} users</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing} className="h-8 gap-1.5 text-zinc-600 dark:text-zinc-400">
            <RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-zinc-600 dark:text-zinc-400 w-[90px] justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="truncate">{sort === "recent" ? "Recent" : "Name"}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[120px]">
              <DropdownMenuItem onClick={() => setSort("recent")} className="text-sm">Recent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("name")} className="text-sm">Name A-Z</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            placeholder="Search by name, email, or Clerk ID..."
            className="w-full rounded-md bg-white dark:bg-zinc-950 pl-9 pr-12 shadow-sm border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none">
            <kbd className="inline-flex h-5 items-center gap-1 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-1.5 font-mono text-[10px] font-medium text-zinc-500 opacity-100">
              <span className="text-xs">{shortcutPrefix}</span>K
            </kbd>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredUsers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2 p-8 text-center">
            <Search className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No users found</p>
            <p className="text-xs">No pending users match your search criteria.</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {filteredUsers.map((u) => {
              const isSelected = selectedUserId === u.clerkId;
              const truncateClerkId = u.clerkId.length > 15 ? `${u.clerkId.slice(0, 8)}...${u.clerkId.slice(-4)}` : u.clerkId;
              const initials = (u.name ? u.name.substring(0, 2) : u.email ? u.email.substring(0, 2) : "U").toUpperCase();
              
              let timeAgo = "—";
              if (u.createdAt) {
                // eslint-disable-next-line react-hooks/purity
                const diffMs = Date.now() - u.createdAt;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHrs = Math.floor(diffMins / 60);
                const diffDays = Math.floor(diffHrs / 24);
                
                if (diffMins < 1) timeAgo = "just now";
                else if (diffMins < 60) timeAgo = `${diffMins} min ago`;
                else if (diffHrs < 24) timeAgo = `${diffHrs} hr ago`;
                else timeAgo = `${diffDays} days ago`;
              }
              
              const absoluteTime = u.createdAt ? new Date(u.createdAt).toLocaleString(undefined, { 
                year: 'numeric', month: '2-digit', day: '2-digit', 
                hour: '2-digit', minute: '2-digit', hour12: false 
              }) : "";

              return (
                <li
                  key={u._id}
                  className={`group flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all border ${
                    isSelected 
                      ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30" 
                      : "bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  }`}
                  onClick={() => onSelectUser(u.clerkId)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex items-center justify-center h-10 w-10 rounded-full font-bold text-sm shrink-0 ${
                      isSelected 
                        ? "bg-blue-600 text-white" 
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}>
                      {initials}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm truncate ${
                          isSelected ? "text-blue-950 dark:text-blue-100" : "text-zinc-900 dark:text-zinc-100"
                        }`}>
                          {u.name || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`truncate ${
                          isSelected ? "text-blue-700/80 dark:text-blue-300/80" : "text-zinc-500"
                        }`}>
                          {u.email || u.clerkId}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
                        <span className={`font-mono hidden sm:inline ${
                          isSelected ? "text-blue-600/70 dark:text-blue-400/70" : "text-zinc-400"
                        }`}>
                          {truncateClerkId}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                    <span className={`text-xs font-medium ${
                      isSelected ? "text-blue-800 dark:text-blue-200" : "text-zinc-600 dark:text-zinc-400"
                    }`}>
                      {timeAgo}
                    </span>
                    <span className={`text-[10px] hidden sm:block ${
                      isSelected ? "text-blue-600/60 dark:text-blue-400/60" : "text-zinc-400"
                    }`}>
                      {absoluteTime}
                    </span>
                  </div>

                  <div className="w-5 flex justify-end shrink-0">
                    <div className={`rounded-full h-5 w-5 flex items-center justify-center ${
                      isSelected 
                        ? "bg-blue-600 text-white" 
                        : "border-2 border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-300 dark:group-hover:border-zinc-600"
                    }`}>
                      {isSelected && <CheckCircle2 className="h-5 w-5" />}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
