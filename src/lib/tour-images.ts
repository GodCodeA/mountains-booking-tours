import alaArcha from "@/assets/tour-ala-archa.webp";
import songKul from "@/assets/tour-song-kul.webp";
import kelSuu from "@/assets/tour-kel-suu.webp";
import altynArashan from "@/assets/tour-altyn-arashan.webp";
import jyrgalan from "@/assets/tour-jyrgalan.webp";
import issykKul from "@/assets/tour-issyk-kul.webp";
import chonKemin from "@/assets/tour-chon-kemin.webp";
import kegety from "@/assets/tour-kegety.webp";
import suusamyr from "@/assets/tour-suusamyr.webp";
import karakolLakes from "@/assets/tour-karakol-lakes.webp";

const images: Record<string, string> = {
  "ala-archa": alaArcha,
  "song-kul": songKul,
  "kel-suu": kelSuu,
  "altyn-arashan": altynArashan,
  jyrgalan,
  "issyk-kul": issykKul,
  "chon-kemin": chonKemin,
  kegety,
  suusamyr,
  "karakol-lakes": karakolLakes,
};

export function tourImage(key: string): string {
  return images[key] ?? alaArcha;
}

/**
 * Each demo tour has one deliberately location-specific image. Until a
 * photographer provides a verified gallery for that exact route, avoid
 * displaying unrelated destination photos as if they belonged to the tour.
 */
export function tourGallery(key: string): string[] {
  return [tourImage(key)];
}
