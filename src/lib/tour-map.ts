import { localText, type Language } from "./i18n";

type MapPoint = {
  latitude: number;
  longitude: number;
  english: string;
  russian: string;
  kyrgyz: string;
};

// These pins identify the real destination area only. They are deliberately
// not presented as a route, trail GPX, pickup point, or emergency location.
const points: Record<string, MapPoint> = {
  "ala-archa-day-hike": {
    latitude: 42.583,
    longitude: 74.483,
    english: "Ala-Archa Nature Park",
    russian: "Национальный парк Ала-Арча",
    kyrgyz: "Ала-Арча жаратылыш паркы",
  },
  "song-kul-adventure": {
    latitude: 41.833,
    longitude: 75.167,
    english: "Song-Kul Lake",
    russian: "Озеро Сон-Куль",
    kyrgyz: "Соң-Көл",
  },
  "kel-suu-adventure": {
    latitude: 40.643056,
    longitude: 76.395,
    english: "Kel-Suu Lake",
    russian: "Озеро Кель-Суу",
    kyrgyz: "Көл-Суу көлү",
  },
  "altyn-arashan-escape": {
    latitude: 42.353,
    longitude: 78.526,
    english: "Altyn-Arashan valley",
    russian: "Долина Алтын-Арашан",
    kyrgyz: "Алтын-Арашан өрөөнү",
  },
  "jyrgalan-mountain-trek": {
    latitude: 42.6,
    longitude: 79.03,
    english: "Jyrgalan village",
    russian: "Село Жыргалан",
    kyrgyz: "Жыргалан айылы",
  },
  "issyk-kul-mountain-escape": {
    latitude: 42.1,
    longitude: 77.2,
    english: "Southern shore of Issyk-Kul",
    russian: "Южный берег Иссык-Куля",
    kyrgyz: "Ысык-Көлдүн түштүк жээги",
  },
  "chon-kemin-valley-escape": {
    latitude: 42.7,
    longitude: 75.95,
    english: "Chon-Kemin valley",
    russian: "Долина Чон-Кемин",
    kyrgyz: "Чоң-Кемин өрөөнү",
  },
  "kegety-waterfall-hike": {
    latitude: 42.48,
    longitude: 75.18,
    english: "Kegety Gorge",
    russian: "Ущелье Кегеты",
    kyrgyz: "Кегети капчыгайы",
  },
  "suusamyr-jailoo-weekend": {
    latitude: 42.16,
    longitude: 73.93,
    english: "Suusamyr Valley",
    russian: "Суусамырская долина",
    kyrgyz: "Суусамыр өрөөнү",
  },
  "karakol-lakes-trek": {
    latitude: 42.326,
    longitude: 78.478,
    english: "Karakol alpine lakes area",
    russian: "Район Каракольских озёр",
    kyrgyz: "Каракол көлдөрүнүн аймагы",
  },
  "burana-konorchek-day": {
    latitude: 42.746,
    longitude: 75.25,
    english: "Burana Tower and Konorchek canyon area",
    russian: "Башня Бурана и район каньона Конорчек",
    kyrgyz: "Бурана мунарасы жана Конорчек капчыгайынын аймагы",
  },
  "jeti-oguz-barskoon-escape": {
    latitude: 42.322,
    longitude: 78.008,
    english: "Jeti-Oguz and Barskoon area",
    russian: "Район Жети-Огуза и Барскоона",
    kyrgyz: "Жети-Өгүз жана Барскоон аймагы",
  },
  "arslanbob-walnut-forest": {
    latitude: 41.341,
    longitude: 72.932,
    english: "Arslanbob village and walnut forest area",
    russian: "Село Арсланбоб и район орехового леса",
    kyrgyz: "Арстанбап айылы жана жаңгак токоюнун аймагы",
  },
};

export function tourMapPoint(slug: string, language: Language) {
  const point = points[slug];
  if (!point) return undefined;
  return {
    ...point,
    label: localText(language, point.english, point.russian, point.kyrgyz),
  };
}

export function googleMapsEmbedUrl(point: Pick<MapPoint, "latitude" | "longitude">) {
  return `https://www.google.com/maps?q=${point.latitude},${point.longitude}&z=11&output=embed`;
}

export function googleMapsUrl(point: Pick<MapPoint, "latitude" | "longitude">) {
  return `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`;
}
