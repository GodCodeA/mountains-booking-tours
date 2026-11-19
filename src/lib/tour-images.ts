import alaArcha from "@/assets/tour-ala-archa.jpg";
import songKul from "@/assets/tour-song-kul.jpg";
import kelSuu from "@/assets/tour-kel-suu.jpg";
import altynArashan from "@/assets/tour-altyn-arashan.jpg";
import jyrgalan from "@/assets/tour-jyrgalan.jpg";
import issykKul from "@/assets/tour-issyk-kul.jpg";
import chonKemin from "@/assets/tour-chon-kemin.jpg";
import kegety from "@/assets/tour-kegety.jpg";
import suusamyr from "@/assets/tour-suusamyr.jpg";
import karakolLakes from "@/assets/tour-karakol-lakes.jpg";

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
