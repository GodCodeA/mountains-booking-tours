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
import alaArchaTrail from "@/assets/tour-ala-archa-gallery-trail.webp";
import alaArchaRiver from "@/assets/tour-ala-archa-gallery-river.webp";
import songKulYurts from "@/assets/tour-song-kul-gallery-yurts.webp";
import songKulHorse from "@/assets/tour-song-kul-gallery-horse.webp";
import kelSuuLake from "@/assets/tour-kel-suu-gallery-lake.webp";
import kelSuuCamp from "@/assets/tour-kel-suu-gallery-camp.webp";
import altynArashanSprings from "@/assets/tour-altyn-arashan-gallery-springs.webp";
import altynArashanMeadow from "@/assets/tour-altyn-arashan-gallery-meadow.webp";
import jyrgalanRidge from "@/assets/tour-jyrgalan-gallery-ridge.webp";
import jyrgalanCamp from "@/assets/tour-jyrgalan-gallery-camp.webp";
import issykKulShore from "@/assets/tour-issyk-kul-gallery-shore.webp";
import issykKulGorge from "@/assets/tour-issyk-kul-gallery-gorge.webp";
import chonKeminGuesthouse from "@/assets/tour-chon-kemin-gallery-guesthouse.webp";
import chonKeminTrail from "@/assets/tour-chon-kemin-gallery-trail.webp";
import kegetyWaterfall from "@/assets/tour-kegety-gallery-waterfall.webp";
import kegetyTrail from "@/assets/tour-kegety-gallery-trail.webp";
import suusamyrYurts from "@/assets/tour-suusamyr-gallery-yurts.webp";
import suusamyrMeadow from "@/assets/tour-suusamyr-gallery-meadow.webp";
import karakolLakesLake from "@/assets/tour-karakol-lakes-gallery-lake.webp";
import karakolLakesTrail from "@/assets/tour-karakol-lakes-gallery-trail.webp";

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

const galleries: Record<string, string[]> = {
  "ala-archa": [alaArcha, alaArchaTrail, alaArchaRiver],
  "song-kul": [songKul, songKulYurts, songKulHorse],
  "kel-suu": [kelSuu, kelSuuLake, kelSuuCamp],
  "altyn-arashan": [altynArashan, altynArashanSprings, altynArashanMeadow],
  jyrgalan: [jyrgalan, jyrgalanRidge, jyrgalanCamp],
  "issyk-kul": [issykKul, issykKulShore, issykKulGorge],
  "chon-kemin": [chonKemin, chonKeminGuesthouse, chonKeminTrail],
  kegety: [kegety, kegetyWaterfall, kegetyTrail],
  suusamyr: [suusamyr, suusamyrYurts, suusamyrMeadow],
  "karakol-lakes": [karakolLakes, karakolLakesLake, karakolLakesTrail],
};

/**
 * The first image is the destination cover. The supporting images are
 * location-inspired illustrations for this demo, not verified route photos.
 */
export function tourGallery(key: string): string[] {
  return galleries[key] ?? [tourImage(key)];
}
