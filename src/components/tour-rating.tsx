import { Star } from "lucide-react";

import { localText, useI18n } from "@/lib/i18n";

export function TourRating({
  rating,
  count,
  compact = false,
}: {
  rating: number;
  count: number;
  compact?: boolean;
}) {
  const { language } = useI18n();
  const text = (english: string, russian: string, kyrgyz: string) =>
    localText(language, english, russian, kyrgyz);
  const formattedRating = new Intl.NumberFormat(
    language === "ru" ? "ru-RU" : language === "ky" ? "ky-KG" : "en-US",
    { minimumFractionDigits: 1, maximumFractionDigits: 1 },
  ).format(rating);
  const roundedRating = Math.round(rating);
  const countLabel = text(`${count} ratings`, `${count} оценок`, `${count} баа`);

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 ${compact ? "text-xs" : "text-sm"}`}
      role="img"
      aria-label={text(
        `Demo rating: ${formattedRating} out of 5 from ${countLabel}`,
        `Демо-рейтинг: ${formattedRating} из 5, ${countLabel}`,
        `Демо-баа: 5тен ${formattedRating}, ${countLabel}`,
      )}
    >
      <span className={`font-bold text-foreground ${compact ? "text-sm" : "text-base"}`}>
        {formattedRating}
      </span>
      <span className="flex gap-0.5 text-primary" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
            fill={index < roundedRating ? "currentColor" : "none"}
          />
        ))}
      </span>
      <span className="text-muted-foreground">({countLabel})</span>
    </div>
  );
}
