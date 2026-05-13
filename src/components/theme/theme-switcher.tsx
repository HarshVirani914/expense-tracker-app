"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IconMoon, IconSun, IconDeviceDesktop } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ThemeSwitcherProps = {
  variant?: "default" | "compact";
  align?: "start" | "center" | "end";
};

export const ThemeSwitcher = ({
  variant = "default",
  align = "end",
}: ThemeSwitcherProps) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size={variant === "compact" ? "icon" : "default"}>
        <IconSun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const getCurrentIcon = () => {
    switch (theme) {
      case "light":
        return <IconSun className="h-5 w-5" />;
      case "dark":
        return <IconMoon className="h-5 w-5" />;
      default:
        return <IconDeviceDesktop className="h-5 w-5" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "compact" ? "icon" : "default"}
          className={cn(
            "transition-colors",
            variant === "compact" && "h-9 w-9",
          )}
        >
          {getCurrentIcon()}
          {variant === "default" && (
            <span className="ml-2 capitalize">{theme}</span>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-36">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "cursor-pointer",
            theme === "light" && "bg-accent text-accent-foreground",
          )}
        >
          <IconSun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "cursor-pointer",
            theme === "dark" && "bg-accent text-accent-foreground",
          )}
        >
          <IconMoon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "cursor-pointer",
            theme === "system" && "bg-accent text-accent-foreground",
          )}
        >
          <IconDeviceDesktop className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
