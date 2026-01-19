"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ShareInstagramButtonProps {
  shareUrl: string;
}

export function ShareInstagramButton({ shareUrl }: ShareInstagramButtonProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "sharing">(
    "loading",
  );
  const sharingRef = useRef(false);
  const fileRef = useRef<File | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function prefetch() {
      try {
        const response = await fetch(shareUrl);
        if (cancelled) return;
        if (!response.ok) throw new Error("Failed to fetch");

        const blob = await response.blob();
        if (cancelled) return;

        fileRef.current = new File([blob], "goongoom-share.png", {
          type: "image/png",
        });
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("ready");
      }
    }

    prefetch();
    return () => {
      cancelled = true;
    };
  }, [shareUrl]);

  const handleShare = async () => {
    if (sharingRef.current) return;
    if (!fileRef.current) {
      window.open(shareUrl, "_blank");
      return;
    }

    sharingRef.current = true;
    setStatus("sharing");

    try {
      const canShare = navigator.canShare?.({ files: [fileRef.current] });

      if (canShare) {
        await navigator.share({
          files: [fileRef.current],
          title: "궁금닷컴",
          text: "궁금닷컴에서 공유",
        });
      } else {
        const url = URL.createObjectURL(fileRef.current);
        const a = document.createElement("a");
        a.href = url;
        a.download = "goongoom-share.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      const isUserCancelled =
        error instanceof Error && error.name === "AbortError";
      if (!isUserCancelled) {
        const url = URL.createObjectURL(fileRef.current);
        const a = document.createElement("a");
        a.href = url;
        a.download = "goongoom-share.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      sharingRef.current = false;
      setStatus("ready");
    }
  };

  return (
    <Button
      variant="link"
      size="xs"
      onClick={handleShare}
      disabled={status === "loading" || status === "sharing"}
    >
      {status === "loading"
        ? "이미지 준비 중..."
        : status === "sharing"
          ? "공유 중..."
          : "인스타그램 이미지 공유하기"}
    </Button>
  );
}
