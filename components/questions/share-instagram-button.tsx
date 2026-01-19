"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ShareInstagramButtonProps {
  shareUrl: string;
}

export function ShareInstagramButton({ shareUrl }: ShareInstagramButtonProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const response = await fetch(shareUrl);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const file = new File([blob], "goongoom-share.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "궁금닷컴",
          text: "궁금닷컴에서 공유",
        });
      } else {
        window.open(shareUrl, "_blank");
      }
    } catch (error) {
      console.error("Share failed:", error);
      window.open(shareUrl, "_blank");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      variant="link"
      size="xs"
      onClick={handleShare}
      disabled={isSharing}
    >
      {isSharing ? "준비 중..." : "인스타그램 이미지 공유하기"}
    </Button>
  );
}
