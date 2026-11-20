import type { Language } from "./i18n";

export type ReadinessItem = {
  id: "fitness" | "footwear" | "layers" | "water" | "overnight" | "altitude";
  label: string;
  detail: string;
};

type ReadinessCopy = Record<ReadinessItem["id"], Omit<ReadinessItem, "id">>;

const copy: Record<Language, ReadinessCopy> = {
  en: {
    fitness: {
      label: "Comfortable with the effort",
      detail: "You can walk steadily for the planned activity level.",
    },
    footwear: {
      label: "Proper hiking footwear",
      detail: "Wear grippy, already-broken-in shoes or boots.",
    },
    layers: {
      label: "Warm and waterproof layers",
      detail: "Mountain weather can change quickly, even in summer.",
    },
    water: { label: "Water ready", detail: "Bring a refillable bottle with at least 1.5 litres." },
    overnight: {
      label: "Ready for an overnight stay",
      detail: "You are comfortable with a yurt, guesthouse or camp night.",
    },
    altitude: {
      label: "Ready for mountain altitude",
      detail: "Take the first day calmly and tell the guide about any concerns.",
    },
  },
  ru: {
    fitness: {
      label: "Готовы к нагрузке",
      detail: "Вы можете уверенно идти в темпе, подходящем для уровня этого маршрута.",
    },
    footwear: {
      label: "Есть подходящая обувь",
      detail: "Нужны разношенные ботинки или кроссовки с хорошим сцеплением.",
    },
    layers: {
      label: "Есть тёплые и непромокаемые слои",
      detail: "Погода в горах может быстро измениться даже летом.",
    },
    water: {
      label: "Подготовлена вода",
      detail: "Возьмите многоразовую бутылку объёмом не менее 1,5 литра.",
    },
    overnight: {
      label: "Готовы к ночёвке",
      detail: "Вам комфортно ночевать в юрте, гостевом доме или лагере.",
    },
    altitude: {
      label: "Готовы к высоте",
      detail: "В первый день не спешите и сообщите гиду о любых особенностях самочувствия.",
    },
  },
  ky: {
    fitness: {
      label: "Жүктөмгө даярсыз",
      detail: "Бул маршруттун деңгээлине ылайык темпте ишенимдүү баса аласыз.",
    },
    footwear: {
      label: "Ылайыктуу бут кийим бар",
      detail: "Таманы жакшы кармаган, мурда кийилген бут кийим же ботинка керек.",
    },
    layers: {
      label: "Жылуу жана суу өткөрбөгөн кийим бар",
      detail: "Тоодогу аба ырайы жайында да тез өзгөрүшү мүмкүн.",
    },
    water: {
      label: "Суу даяр",
      detail: "Кеминде 1,5 литрлик көп жолу колдонулуучу бөтөлкө алыңыз.",
    },
    overnight: {
      label: "Түнөккө даярсыз",
      detail: "Боз үйдө, конок үйүндө же лагерде түнөөгө ыңгайлуусуз.",
    },
    altitude: {
      label: "Бийиктикке даярсыз",
      detail: "Биринчи күнү шашпаңыз жана ден соолукка байланыштуу жагдайларды гидге айтыңыз.",
    },
  },
};

/** A short self-check, not a medical assessment or a safety clearance. */
export function readinessItems(
  language: Language,
  difficulty: string,
  durationDays: number,
): ReadinessItem[] {
  const ids: ReadinessItem["id"][] = ["fitness", "footwear", "layers", "water"];
  const isChallenging = ["Challenging", "Сложный", "Татаал"].includes(difficulty);

  if (durationDays > 1) ids.push("overnight");
  if (isChallenging || durationDays >= 3) ids.push("altitude");

  return ids.map((id) => ({ id, ...copy[language][id] }));
}
