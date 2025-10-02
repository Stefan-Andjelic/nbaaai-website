"use client";

import { LeaderboardEntry } from "@/types/supabase";
import { LeaderboardConfigModal } from "./LeaderboardCardModal";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { getPlayerImageUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Settings, Download, Share2, Copy, Check } from "lucide-react";
import { useState, useRef } from "react";
import { toPng } from "html-to-image";

interface LeaderboardCardProps {
  title: string;
  stat: "PPG" | "RPG" | "APG" | "SPG" | "BPG" | "TPG" | "FG%" | "3P%" | "FT%";
  timeframe: "CURRENT_SEASON" | "ALL_TIME";
  data: LeaderboardEntry[];
  maxEntries?: number;
  // Props for custom leaderboards
  isCustom?: boolean;
  customConfig?: {
    topN: number;
    statFilters: Array<{
      stat: string;
      operator: string;
      value: number;
    }>;
  };
  leaderboardId?: string; // For generating URL to full list page
}

export function LeaderboardCard({
  title,
  stat,
  timeframe,
  data,
  maxEntries = 5,
  isCustom = false,
  customConfig,
  leaderboardId,
}: LeaderboardCardProps) {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const generateImage = async () => {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
        filter: (node) => {
          return !node.hasAttribute?.("data-html2canvas-ignore");
        }
      });
      return dataUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareClick = async () => {
    const dataUrl = await generateImage();
    if (dataUrl) {
      setImageDataUrl(dataUrl);
      setIsShareModalOpen(true);
    }
  };

  const handleDownload = () => {
    if (!imageDataUrl) return;

    const link = document.createElement("a");
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = imageDataUrl;
    link.click();
  };

  const handleCopyImage = async () => {
    if (!imageDataUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying image:', error);
      alert('Failed to copy image. Try downloading instead.');
    }
  };

  return (
    <>
      <Card ref={cardRef} className="w-full border-2 border-opacity-100 border-[#FF7D00]">
          <CardHeader className="relative">
            <div className="flex items-start justify-between">
              <CardTitle className="flex-1 pr-16">{title}</CardTitle>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-1" data-html2canvas-ignore="true">
                {/* Share Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleShareClick}
                  disabled={isGenerating}
                  title="Share or download as image"
                >
                  {isGenerating ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                </Button>

                {/* Gear Icon */}
                {isCustom && customConfig && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsConfigModalOpen(true)}
                    title="View configuration"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {data.slice(0, maxEntries).map((player, index) => (
              <Link
                key={player.player_id}
                href={`/players/${player.player_id}`}
                className="block"
              >
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                      src={getPlayerImageUrl(player.player_id)}
                      alt={`${player.player_id} headshot`}
                      fill
                      className="object-cover"
                      sizes="48px"
                      quality={90}
                      unoptimized
                    />
                  </div>

                  {/* RANK & NAME */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">
                      {index + 1}. {player.player_name}
                    </span>
                  </div>

                  {/* STAT VALUE */}
                  <span className="font-semibold">{player.value}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* See Full List Button */}
          {leaderboardId && (
            <Link
              href={`/ethical-leaderboards/${leaderboardId}`}
              className="block mt-4"
            >
              <Button variant="outline" className="w-full gap-2 font-bold">
                See Full List
              </Button>
            </Link>
          )}

          {/* Branding footer for shared images */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-center text-[#590766]">
            <p className="text-xs text-muted-foreground text-[#590766]">
              NBAAAI • Ethical Leaderboards
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Leaderboard</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Preview */}
            {imageDataUrl && (
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <img 
                  src={imageDataUrl} 
                  alt="Leaderboard preview" 
                  className="w-full"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleCopyImage}
                className="flex-1 gap-2"
                variant="outline"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Image
                  </>
                )}
              </Button>

              <Button
                onClick={handleDownload}
                className="flex-1 gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Copy the image to paste it directly into social media posts, or download to save it to your device.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configuration Modal */}
      {isCustom && customConfig && (
        <LeaderboardConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          title={title}
          config={customConfig}
        />
      )}
    </>
  );
}
