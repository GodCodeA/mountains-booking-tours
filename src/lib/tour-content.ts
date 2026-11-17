// Demo itinerary and packing content per tour, keyed by tour slug.
// Core tour facts (price, duration, group size, inclusions) live in the database.

export type ItineraryStep = { time: string; title: string; body: string };

export type TourExtras = {
  itinerary: ItineraryStep[];
  whatToBring: string[];
};

export const CANCELLATION_POLICY =
  "No payment is taken online, so cancelling costs nothing. Please cancel or move your date at least 48 hours before departure so the spot can go to another guest. If weather makes the route unsafe, the guide may change the route or move the trip to another date — you never pay for a trip that doesn't run.";

const baseKit = [
  "Comfortable hiking boots with good grip",
  "Warm layer and waterproof jacket — mountain weather changes fast",
  "Sun hat, sunglasses and sunscreen",
  "Reusable water bottle (1.5 L or more)",
  "Passport or ID",
  "Any personal medication",
];

const overnightKit = [
  ...baseKit,
  "Warm hat and gloves — nights are cold even in summer",
  "Headlamp",
  "Small towel and toiletries",
  "Cash in som for snacks and souvenirs",
];

const content: Record<string, TourExtras> = {
  "ala-archa-day-hike": {
    itinerary: [
      {
        time: "07:30",
        title: "Meet at Ala-Too Square",
        body: "Drive about 1 hour to Ala-Archa National Park.",
      },
      {
        time: "09:00",
        title: "Hike up the valley",
        body: "Steady climb along the river through juniper forest, with regular breaks.",
      },
      {
        time: "12:30",
        title: "Lunch with a view",
        body: "Picnic lunch at the turnaround point with glacier views.",
      },
      { time: "14:00", title: "Descent", body: "Walk back down the same trail at a relaxed pace." },
      { time: "17:30", title: "Back in Bishkek", body: "Drop-off at Ala-Too Square." },
    ],
    whatToBring: baseKit,
  },
  "song-kul-adventure": {
    itinerary: [
      {
        time: "Day 1",
        title: "Bishkek to Song-Kul",
        body: "07:00 pick-up. Drive through Kochkor and over the Kalmak-Ashuu pass to the lake and settle into the yurt camp.",
      },
      {
        time: "Day 2",
        title: "Life on the jailoo",
        body: "Lakeshore walk or optional horse ride, dinner with the herding family hosting the camp.",
      },
      {
        time: "Day 3",
        title: "Return to Bishkek",
        body: "Slow morning at the lake, drive back to Bishkek by evening.",
      },
    ],
    whatToBring: overnightKit,
  },
  "kel-suu-adventure": {
    itinerary: [
      {
        time: "Day 1",
        title: "Bishkek to Naryn region",
        body: "06:30 pick-up. Long scenic drive south, overnight in a guesthouse.",
      },
      {
        time: "Day 2",
        title: "Into the Kel-Suu valley",
        body: "Off-road drive towards the border zone and camp near the lake.",
      },
      {
        time: "Day 3",
        title: "Kel-Suu lake",
        body: "Walk to the lake and explore the narrow gorge, back to camp.",
      },
      {
        time: "Day 4",
        title: "Return to Bishkek",
        body: "Drive back north, arriving in the evening.",
      },
    ],
    whatToBring: [
      ...overnightKit,
      "Passport is required — the area needs a border permit, which we arrange",
    ],
  },
  "altyn-arashan-escape": {
    itinerary: [
      {
        time: "Day 1",
        title: "Karakol to Altyn-Arashan",
        body: "09:00 start from Karakol. Hike up the valley, soak in the hot springs, overnight in a mountain guesthouse.",
      },
      {
        time: "Day 2",
        title: "Valley views and return",
        body: "Morning walk towards views of Palatka peak, then descend to Karakol by afternoon.",
      },
    ],
    whatToBring: [...overnightKit, "Swimwear for the hot springs"],
  },
  "jyrgalan-mountain-trek": {
    itinerary: [
      {
        time: "Day 1",
        title: "Into the hills",
        body: "09:00 start from Jyrgalan village. Trek over grassy ridges to a high camp.",
      },
      {
        time: "Day 2",
        title: "Pass day",
        body: "The longest day: cross a high pass with wide Tian Shan views, descend to camp.",
      },
      {
        time: "Day 3",
        title: "Valley descent",
        body: "Easier walk back down to the village by afternoon.",
      },
    ],
    whatToBring: [...overnightKit, "Trekking poles (recommended)", "Personal sleeping bag liner"],
  },
  "issyk-kul-mountain-escape": {
    itinerary: [
      {
        time: "Day 1",
        title: "Bishkek to the north shore",
        body: "08:00 pick-up. Drive to Issyk-Kul, afternoon on the beach, lakeside guesthouse.",
      },
      {
        time: "Day 2",
        title: "Gorge walk",
        body: "Easy walk in a gorge above the lake, evening swim.",
      },
      {
        time: "Day 3",
        title: "Around the lake",
        body: "Drive to the south shore, short walk in a colourful canyon.",
      },
      {
        time: "Day 4",
        title: "Mountain day",
        body: "Day hike in a valley above the lake with views back over the water.",
      },
      {
        time: "Day 5",
        title: "Return to Bishkek",
        body: "Slow morning by the lake and drive back.",
      },
    ],
    whatToBring: [...baseKit, "Swimwear"],
  },
};

const russianBaseKit = [
  "Удобные треккинговые ботинки с хорошим сцеплением",
  "Тёплый слой и непромокаемая куртка — погода в горах быстро меняется",
  "Панама или кепка, солнцезащитные очки и крем",
  "Многоразовая бутылка для воды (от 1,5 л)",
  "Паспорт или удостоверение личности",
  "Личные лекарства",
];

const russianOvernightKit = [
  ...russianBaseKit,
  "Тёплая шапка и перчатки — ночи холодные даже летом",
  "Налобный фонарь",
  "Небольшое полотенце и туалетные принадлежности",
  "Наличные сомы на перекусы и сувениры",
];

const russianContent: Record<string, TourExtras> = {
  "ala-archa-day-hike": {
    itinerary: [
      {
        time: "07:30",
        title: "Встреча на площади Ала-Тоо",
        body: "Около часа в дороге до национального парка Ала-Арча.",
      },
      {
        time: "09:00",
        title: "Подъём по долине",
        body: "Размеренный подъём вдоль реки через можжевеловый лес с регулярными остановками.",
      },
      {
        time: "12:30",
        title: "Обед с видом",
        body: "Пикник у точки разворота с видом на ледники.",
      },
      { time: "14:00", title: "Спуск", body: "Спокойно возвращаемся по той же тропе." },
      { time: "17:30", title: "Возвращение в Бишкек", body: "Высадка на площади Ала-Тоо." },
    ],
    whatToBring: russianBaseKit,
  },
  "song-kul-adventure": {
    itinerary: [
      {
        time: "День 1",
        title: "Из Бишкека на Сон-Куль",
        body: "Выезд в 07:00. Едем через Кочкор и перевал Калмак-Ашуу к озеру, размещаемся в юрточном лагере.",
      },
      {
        time: "День 2",
        title: "Жизнь на джайлоо",
        body: "Прогулка у озера или конная поездка, ужин с семьёй пастухов, принимающей лагерь.",
      },
      {
        time: "День 3",
        title: "Возвращение в Бишкек",
        body: "Неторопливое утро у озера и возвращение в Бишкек к вечеру.",
      },
    ],
    whatToBring: russianOvernightKit,
  },
  "kel-suu-adventure": {
    itinerary: [
      {
        time: "День 1",
        title: "Бишкек — Нарынская область",
        body: "Выезд в 06:30. Долгая живописная дорога на юг, ночёвка в гостевом доме.",
      },
      {
        time: "День 2",
        title: "В долину Кель-Суу",
        body: "По бездорожью едем к приграничной зоне и ставим лагерь недалеко от озера.",
      },
      {
        time: "День 3",
        title: "Озеро Кель-Суу",
        body: "Идём к озеру, исследуем узкое ущелье и возвращаемся в лагерь.",
      },
      { time: "День 4", title: "Возвращение в Бишкек", body: "Едем на север и прибываем вечером." },
    ],
    whatToBring: [
      ...russianOvernightKit,
      "Обязательно возьмите паспорт — для района нужен пропуск, его оформим мы",
    ],
  },
  "altyn-arashan-escape": {
    itinerary: [
      {
        time: "День 1",
        title: "Из Каракола в Алтын-Арашан",
        body: "Старт в 09:00 из Каракола. Поднимаемся по долине, купаемся в источниках и ночуем в горном гостевом доме.",
      },
      {
        time: "День 2",
        title: "Виды долины и возвращение",
        body: "Утренняя прогулка к видам на пик Палатка, затем спускаемся в Каракол после обеда.",
      },
    ],
    whatToBring: [...russianOvernightKit, "Купальник для горячих источников"],
  },
  "jyrgalan-mountain-trek": {
    itinerary: [
      {
        time: "День 1",
        title: "В горы",
        body: "Старт в 09:00 из села Жыргалан. Идём по травянистым хребтам к высокому лагерю.",
      },
      {
        time: "День 2",
        title: "День перевала",
        body: "Самый длинный день: переходим высокий перевал с панорамой Тянь-Шаня и спускаемся в лагерь.",
      },
      {
        time: "День 3",
        title: "Спуск в долину",
        body: "Более лёгкая прогулка обратно в село к полудню.",
      },
    ],
    whatToBring: [
      ...russianOvernightKit,
      "Треккинговые палки (рекомендуются)",
      "Личный вкладыш для спального мешка",
    ],
  },
  "issyk-kul-mountain-escape": {
    itinerary: [
      {
        time: "День 1",
        title: "Из Бишкека на северный берег",
        body: "Выезд в 08:00. Едем к Иссык-Кулю, отдыхаем на пляже и ночуем в гостевом доме у озера.",
      },
      {
        time: "День 2",
        title: "Прогулка по ущелью",
        body: "Лёгкая прогулка по ущелью над озером и вечернее купание.",
      },
      {
        time: "День 3",
        title: "Вокруг озера",
        body: "Едем на южный берег и гуляем по яркому каньону.",
      },
      {
        time: "День 4",
        title: "Горный день",
        body: "Однодневный поход по долине над озером с видами на воду.",
      },
      {
        time: "День 5",
        title: "Возвращение в Бишкек",
        body: "Неторопливое утро у озера и дорога обратно.",
      },
    ],
    whatToBring: [...russianBaseKit, "Купальник"],
  },
};

export const CANCELLATION_POLICY_RU =
  "Онлайн-оплаты нет, поэтому отмена ничего не стоит. Пожалуйста, отмените или перенесите дату минимум за 48 часов до выезда, чтобы место могло достаться другому гостю. Если погода сделает маршрут небезопасным, гид изменит маршрут или перенесёт поездку — вы никогда не платите за несостоявшийся тур.";

const kyrgyzBaseKit = [
  "Жакшы кармаган ыңгайлуу треккинг бут кийим",
  "Жылуу катмар жана суу өткөрбөгөн күрмө — тоодо аба ырайы тез өзгөрөт",
  "Күнгө каршы баш кийим, көз айнек жана крем",
  "Кайра колдонулуучу суу бөтөлкөсү (1,5 л же андан көп)",
  "Паспорт же өздүк күбөлүк",
  "Жеке дары-дармектер",
];

const kyrgyzOvernightKit = [
  ...kyrgyzBaseKit,
  "Жылуу баш кийим жана мээлей — жайында да түн суук болот",
  "Маңдайга тагылуучу чырак",
  "Кичинекей сүлгү жана гигиена каражаттары",
  "Тамак-аш жана сувенирлер үчүн накталай сом",
];

const kyrgyzContent: Record<string, TourExtras> = {
  "ala-archa-day-hike": {
    itinerary: [
      { time: "07:30", title: "Ала-Тоо аянтында жолугушуу", body: "Ала-Арча улуттук паркына болжол менен бир саат жол." },
      { time: "09:00", title: "Өрөөн менен өйдө чыгуу", body: "Дарыяны бойлой арча токою аркылуу тынымдар менен жай көтөрүлөбүз." },
      { time: "12:30", title: "Кооз жаратылыштын койнунда түшкү тамактануу", body: "Мөңгүлөр көрүнгөн бурулуш чекитинде пикник." },
      { time: "14:00", title: "Түшүү", body: "Ошол эле чыйыр менен жай темпте кайра түшөбүз." },
      { time: "17:30", title: "Бишкекке кайтуу", body: "Ала-Тоо аянтында түшүрүп кетебиз." },
    ],
    whatToBring: kyrgyzBaseKit,
  },
  "song-kul-adventure": {
    itinerary: [
      { time: "1-күн", title: "Бишкектен Соң-Көлгө", body: "07:00дө жолго чыгабыз. Кочкор жана Калмак-Ашуу ашуусу аркылуу көлгө барып, боз үй лагерине жайгашабыз." },
      { time: "2-күн", title: "Жайлоодогу жашоо", body: "Көл жээгинде сейилдөө же ат менен саякаттоо, андан соң конокторду кабыл алган малчынын үй-бүлөсү менен бирге кечки тамактануу." },
      { time: "3-күн", title: "Бишкекке кайтуу", body: "Көл жээгинде жай эртең мененки убакыт жана кечке маал Бишкекке кайтуу." },
    ],
    whatToBring: kyrgyzOvernightKit,
  },
  "kel-suu-adventure": {
    itinerary: [
      { time: "1-күн", title: "Бишкек — Нарын облусу", body: "06:30да жолго чыгабыз. Түштүктү көздөй узак кооз жол, конок үйүндө түнөө." },
      { time: "2-күн", title: "Көл-Суу өрөөнүнө", body: "Жол тандабас унаа менен чек ара аймагын көздөй барып, көлдүн жанында лагерь курабыз." },
      { time: "3-күн", title: "Көл-Суу көлү", body: "Көлгө чейин жөө барып, кууш капчыгайды көрүп, кайра лагерге келебиз." },
      { time: "4-күн", title: "Бишкекке кайтуу", body: "Түндүктү көздөй жол тартып, кечинде келебиз." },
    ],
    whatToBring: [...kyrgyzOvernightKit, "Паспорт сөзсүз керек — аймак үчүн чек ара уруксаты зарыл, аны биз даярдайбыз"],
  },
  "altyn-arashan-escape": {
    itinerary: [
      { time: "1-күн", title: "Караколдон Алтын-Арашанга", body: "Караколдон 09:00дө чыгабыз. Өрөөн менен өйдө басып, ысык булактарга түшүп, тоодогу конок үйүндө түнөбүз." },
      { time: "2-күн", title: "Өрөөн көрүнүштөрү жана кайтуу", body: "Эртең менен Палатка чокусун карай сейилдеп, түштөн кийин Караколго түшөбүз." },
    ],
    whatToBring: [...kyrgyzOvernightKit, "Ысык булактар үчүн купальник"],
  },
  "jyrgalan-mountain-trek": {
    itinerary: [
      { time: "1-күн", title: "Кырларга жол", body: "Жыргалан айылынан 09:00дө чыгабыз. Чөптүү кырлар менен бийик лагерге чейин басабыз." },
      { time: "2-күн", title: "Ашуу күнү", body: "Эң узак күн: Теңир-Тоонун кеңири көрүнүшү бар бийик ашуудан өтүп, лагерге түшөбүз." },
      { time: "3-күн", title: "Өрөөнгө түшүү", body: "Түшкө чейин айылга кайта турган жеңилирээк жөө жол." },
    ],
    whatToBring: [...kyrgyzOvernightKit, "Треккинг таяктары (сунушталат)", "Уктоочу баштык үчүн жеке ички кап"],
  },
  "issyk-kul-mountain-escape": {
    itinerary: [
      { time: "1-күн", title: "Бишкектен түндүк жээкке", body: "08:00дө алып кетебиз. Ысык-Көлгө барабыз, түштөн кийин жээкте эс алып, көл жээгиндеги конок үйүндө түнөбүз." },
      { time: "2-күн", title: "Капчыгайда сейилдөө", body: "Көлдүн үстүндөгү капчыгайда жеңил сейил жана кечинде сууга түшүү." },
      { time: "3-күн", title: "Көлдү айланып", body: "Түштүк жээкке барып, кооз түстүү капчыгайда кыскача сейилдейбиз." },
      { time: "4-күн", title: "Тоо күнү", body: "Көлгө көрүнүшү бар өрөөндө бир күндүк жөө жүрүш." },
      { time: "5-күн", title: "Бишкекке кайтуу", body: "Көлдүн жанында жай эртең мененки убакыт жана кайра жол." },
    ],
    whatToBring: [...kyrgyzBaseKit, "Купальник"],
  },
};

export const CANCELLATION_POLICY_KY =
  "Онлайн төлөм жок болгондуктан, саякатты жокко чыгаруу акысыз. Сураныч, сиздин ордуңузга башка конок бара алышы үчүн, саякатты жокко чыгарууну же күнүн өзгөртүүнү жолго чыгууга кеминде 48 саат калганда билдириңиз. Эгер аба ырайына байланыштуу маршрут кооптуу болуп калса, гид маршрутту өзгөртөт же саякатты башка күнгө жылдырат. Өтпөй калган саякат үчүн сизден эч кандай акы алынбайт.";

export function tourExtras(slug: string, language: "en" | "ru" | "ky" = "en"): TourExtras {
  if (language === "ru")
    return russianContent[slug] ?? { itinerary: [], whatToBring: russianBaseKit };
  if (language === "ky")
    return kyrgyzContent[slug] ?? { itinerary: [], whatToBring: kyrgyzBaseKit };
  return content[slug] ?? { itinerary: [], whatToBring: baseKit };
}
