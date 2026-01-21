"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sun03Icon, Moon02Icon, ComputerIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  if (!mounted) {
    return (
      <Button
        aria-label="테마 전환"
        size="icon-sm"
        variant="ghost"
      >
        <HugeiconsIcon icon={ComputerIcon} className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      aria-label={`테마 전환 (현재: ${theme === "light" ? "라이트" : theme === "dark" ? "다크" : "시스템"})`}
      onClick={cycleTheme}
      size="icon-sm"
      variant="ghost"
    >
      {theme === "light" ? (
        <HugeiconsIcon icon={Sun03Icon} className="size-4" />
      ) : theme === "dark" ? (
        <HugeiconsIcon icon={Moon02Icon} className="size-4" />
      ) : (
        <HugeiconsIcon icon={ComputerIcon} className="size-4" />
      )}
    </Button>
  );
}
