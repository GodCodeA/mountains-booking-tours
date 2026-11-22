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
  "chon-kemin-valley-escape": {
    itinerary: [
      {
        time: "Day 1",
        title: "Into Chon-Kemin",
        body: "08:00 pick-up in Bishkek. Drive east to the valley, settle into a family guesthouse and take an easy riverside walk.",
      },
      {
        time: "Day 2",
        title: "Forest and pasture walk",
        body: "A relaxed morning walk through spruce forest and open pasture, then return to Bishkek after lunch.",
      },
    ],
    whatToBring: overnightKit,
  },
  "kegety-waterfall-hike": {
    itinerary: [
      {
        time: "07:00",
        title: "Leave Bishkek",
        body: "Meet at Ala-Too Square and drive to Kegety Gorge.",
      },
      {
        time: "09:00",
        title: "Walk to the waterfall",
        body: "Follow the stream into the gorge at a steady pace, with rests and a picnic before returning.",
      },
      {
        time: "18:00",
        title: "Back in Bishkek",
        body: "Return to Ala-Too Square by early evening.",
      },
    ],
    whatToBring: baseKit,
  },
  "suusamyr-jailoo-weekend": {
    itinerary: [
      {
        time: "Day 1",
        title: "Bishkek to Suusamyr",
        body: "08:00 pick-up. Drive over the Too-Ashuu pass, arrive at the yurt camp and walk across the pasture before dinner.",
      },
      {
        time: "Day 2",
        title: "Morning on the jailoo",
        body: "Slow breakfast, a short valley walk and return to Bishkek in the afternoon.",
      },
    ],
    whatToBring: [...overnightKit, "Comfortable clothes for the yurt camp"],
  },
  "karakol-lakes-trek": {
    itinerary: [
      {
        time: "Day 1",
        title: "Karakol to high camp",
        body: "08:00 start from Karakol. Transfer to the trailhead and hike up the valley to camp.",
      },
      {
        time: "Day 2",
        title: "Alpine lake day",
        body: "The longest day: walk to the high lakes beneath the ridge, then return to camp.",
      },
      {
        time: "Day 3",
        title: "Descend to Karakol",
        body: "Break camp and descend through the valley, arriving in Karakol by afternoon.",
      },
    ],
    whatToBring: [
      ...overnightKit,
      "Broken-in hiking boots",
      "Trekking poles (recommended)",
      "Personal sleeping bag",
    ],
  },
  "burana-konorchek-day": {
    itinerary: [
      { time: "08:00", title: "Leave Bishkek", body: "Meet at Ala-Too Square and drive east through the Chuy Valley." },
      { time: "10:00", title: "Burana and Balasagun", body: "Explore the tower area and its open-air stone collection with the guide." },
      { time: "13:00", title: "Konorchek canyon", body: "Easy canyon walk, picnic and time for photos among the red cliffs." },
      { time: "18:00", title: "Back in Bishkek", body: "Return to Ala-Too Square by early evening." },
    ],
    whatToBring: baseKit,
  },
  "jeti-oguz-barskoon-escape": {
    itinerary: [
      { time: "Day 1", title: "Jeti-Oguz red rocks", body: "Start from Karakol, walk beneath the Seven Bulls cliffs and settle into a guesthouse." },
      { time: "Day 2", title: "Barskoon waterfalls", body: "Morning forest walk to the waterfalls, then return to Karakol in the afternoon." },
    ],
    whatToBring: overnightKit,
  },
  "arslanbob-walnut-forest": {
    itinerary: [
      { time: "Day 1", title: "Osh to Arslanbob", body: "Meet in Osh, drive south-west to the village and meet your host family." },
      { time: "Day 2", title: "Forest and waterfall", body: "Gentle walks through the walnut forest and to a waterfall viewpoint." },
      { time: "Day 3", title: "Village morning and return", body: "Free time in the village before the return drive to Osh." },
    ],
    whatToBring: overnightKit,
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
  "chon-kemin-valley-escape": {
    itinerary: [
      {
        time: "День 1",
        title: "В Чон-Кемин",
        body: "Выезд из Бишкека в 08:00. Едем на восток в долину, размещаемся в семейном гостевом доме и гуляем у реки.",
      },
      {
        time: "День 2",
        title: "Лес и пастбища",
        body: "Неторопливая утренняя прогулка по еловому лесу и пастбищам, после обеда возвращаемся в Бишкек.",
      },
    ],
    whatToBring: russianOvernightKit,
  },
  "kegety-waterfall-hike": {
    itinerary: [
      {
        time: "07:00",
        title: "Выезд из Бишкека",
        body: "Встречаемся на площади Ала-Тоо и едем в ущелье Кегеты.",
      },
      {
        time: "09:00",
        title: "К водопаду",
        body: "Идём вдоль ручья вглубь ущелья в комфортном темпе, с остановками и пикником.",
      },
      {
        time: "18:00",
        title: "Возвращение в Бишкек",
        body: "К вечеру возвращаемся на площадь Ала-Тоо.",
      },
    ],
    whatToBring: russianBaseKit,
  },
  "suusamyr-jailoo-weekend": {
    itinerary: [
      {
        time: "День 1",
        title: "Бишкек — Суусамыр",
        body: "Выезд в 08:00. Едем через перевал Тоо-Ашуу, приезжаем в юрточный лагерь и гуляем по пастбищам до ужина.",
      },
      {
        time: "День 2",
        title: "Утро на джайлоо",
        body: "Неспешный завтрак, короткая прогулка по долине и возвращение в Бишкек после обеда.",
      },
    ],
    whatToBring: [...russianOvernightKit, "Удобная одежда для юрточного лагеря"],
  },
  "karakol-lakes-trek": {
    itinerary: [
      {
        time: "День 1",
        title: "Каракол — высокий лагерь",
        body: "Старт в 08:00 из Каракола. Доезжаем до начала тропы и поднимаемся по долине к лагерю.",
      },
      {
        time: "День 2",
        title: "День высокогорных озёр",
        body: "Самый длинный день: идём к озёрам под хребтом и возвращаемся в лагерь.",
      },
      {
        time: "День 3",
        title: "Спуск в Каракол",
        body: "Собираем лагерь, спускаемся по долине и к вечеру возвращаемся в Каракол.",
      },
    ],
    whatToBring: [
      ...russianOvernightKit,
      "Разношенные треккинговые ботинки",
      "Треккинговые палки",
      "Личный спальный мешок",
    ],
  },
  "burana-konorchek-day": {
    itinerary: [
      { time: "08:00", title: "Выезд из Бишкека", body: "Встречаемся на площади Ала-Тоо и едем на восток по Чуйской долине." },
      { time: "10:00", title: "Бурана и Баласагун", body: "Осматриваем территорию башни и каменную коллекцию под открытым небом." },
      { time: "13:00", title: "Каньон Конорчек", body: "Лёгкая прогулка по каньону, пикник и время для фотографий у красных скал." },
      { time: "18:00", title: "Возвращение в Бишкек", body: "К вечеру возвращаемся на площадь Ала-Тоо." },
    ],
    whatToBring: russianBaseKit,
  },
  "jeti-oguz-barskoon-escape": {
    itinerary: [
      { time: "День 1", title: "Красные скалы Жети-Огуза", body: "Старт из Каракола, прогулка у скал «Семь быков» и размещение в гостевом доме." },
      { time: "День 2", title: "Водопады Барскоона", body: "Утренняя прогулка по лесу к водопадам и возвращение в Каракол после обеда." },
    ],
    whatToBring: russianOvernightKit,
  },
  "arslanbob-walnut-forest": {
    itinerary: [
      { time: "День 1", title: "Из Оша в Арсланбоб", body: "Встречаемся в Оше, едем в горное село и знакомимся с принимающей семьёй." },
      { time: "День 2", title: "Лес и водопад", body: "Неспешные прогулки по ореховому лесу и к смотровой точке у водопада." },
      { time: "День 3", title: "Утро в селе и возвращение", body: "Свободное время в селе перед обратной дорогой в Ош." },
    ],
    whatToBring: russianOvernightKit,
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
      {
        time: "07:30",
        title: "Ала-Тоо аянтында жолугушуу",
        body: "Ала-Арча улуттук паркына болжол менен бир саат жол.",
      },
      {
        time: "09:00",
        title: "Өрөөн менен өйдө чыгуу",
        body: "Дарыяны бойлой арча токою аркылуу тынымдар менен жай көтөрүлөбүз.",
      },
      {
        time: "12:30",
        title: "Кооз жаратылыштын койнунда түшкү тамактануу",
        body: "Мөңгүлөр көрүнгөн бурулуш чекитинде пикник.",
      },
      { time: "14:00", title: "Түшүү", body: "Ошол эле чыйыр менен жай темпте кайра түшөбүз." },
      { time: "17:30", title: "Бишкекке кайтуу", body: "Ала-Тоо аянтында түшүрүп кетебиз." },
    ],
    whatToBring: kyrgyzBaseKit,
  },
  "song-kul-adventure": {
    itinerary: [
      {
        time: "1-күн",
        title: "Бишкектен Соң-Көлгө",
        body: "07:00дө жолго чыгабыз. Кочкор жана Калмак-Ашуу ашуусу аркылуу көлгө барып, боз үй лагерине жайгашабыз.",
      },
      {
        time: "2-күн",
        title: "Жайлоодогу жашоо",
        body: "Көл жээгинде сейилдөө же ат менен саякаттоо, андан соң конокторду кабыл алган малчынын үй-бүлөсү менен бирге кечки тамактануу.",
      },
      {
        time: "3-күн",
        title: "Бишкекке кайтуу",
        body: "Көл жээгинде жай эртең мененки убакыт жана кечке маал Бишкекке кайтуу.",
      },
    ],
    whatToBring: kyrgyzOvernightKit,
  },
  "kel-suu-adventure": {
    itinerary: [
      {
        time: "1-күн",
        title: "Бишкек — Нарын облусу",
        body: "06:30да жолго чыгабыз. Түштүктү көздөй узак кооз жол, конок үйүндө түнөө.",
      },
      {
        time: "2-күн",
        title: "Көл-Суу өрөөнүнө",
        body: "Жол тандабас унаа менен чек ара аймагын көздөй барып, көлдүн жанында лагерь курабыз.",
      },
      {
        time: "3-күн",
        title: "Көл-Суу көлү",
        body: "Көлгө чейин жөө барып, кууш капчыгайды көрүп, кайра лагерге келебиз.",
      },
      {
        time: "4-күн",
        title: "Бишкекке кайтуу",
        body: "Түндүктү көздөй жол тартып, кечинде келебиз.",
      },
    ],
    whatToBring: [
      ...kyrgyzOvernightKit,
      "Паспорт сөзсүз керек — аймак үчүн чек ара уруксаты зарыл, аны биз даярдайбыз",
    ],
  },
  "altyn-arashan-escape": {
    itinerary: [
      {
        time: "1-күн",
        title: "Караколдон Алтын-Арашанга",
        body: "Караколдон 09:00дө чыгабыз. Өрөөн менен өйдө басып, ысык булактарга түшүп, тоодогу конок үйүндө түнөбүз.",
      },
      {
        time: "2-күн",
        title: "Өрөөн көрүнүштөрү жана кайтуу",
        body: "Эртең менен Палатка чокусун карай сейилдеп, түштөн кийин Караколго түшөбүз.",
      },
    ],
    whatToBring: [...kyrgyzOvernightKit, "Ысык булактар үчүн купальник"],
  },
  "jyrgalan-mountain-trek": {
    itinerary: [
      {
        time: "1-күн",
        title: "Кырларга жол",
        body: "Жыргалан айылынан 09:00дө чыгабыз. Чөптүү кырлар менен бийик лагерге чейин басабыз.",
      },
      {
        time: "2-күн",
        title: "Ашуу күнү",
        body: "Эң узак күн: Теңир-Тоонун кеңири көрүнүшү бар бийик ашуудан өтүп, лагерге түшөбүз.",
      },
      {
        time: "3-күн",
        title: "Өрөөнгө түшүү",
        body: "Түшкө чейин айылга кайта турган жеңилирээк жөө жол.",
      },
    ],
    whatToBring: [
      ...kyrgyzOvernightKit,
      "Треккинг таяктары (сунушталат)",
      "Уктоочу баштык үчүн жеке ички кап",
    ],
  },
  "issyk-kul-mountain-escape": {
    itinerary: [
      {
        time: "1-күн",
        title: "Бишкектен түндүк жээкке",
        body: "08:00дө алып кетебиз. Ысык-Көлгө барабыз, түштөн кийин жээкте эс алып, көл жээгиндеги конок үйүндө түнөбүз.",
      },
      {
        time: "2-күн",
        title: "Капчыгайда сейилдөө",
        body: "Көлдүн үстүндөгү капчыгайда жеңил сейил жана кечинде сууга түшүү.",
      },
      {
        time: "3-күн",
        title: "Көлдү айланып",
        body: "Түштүк жээкке барып, кооз түстүү капчыгайда кыскача сейилдейбиз.",
      },
      {
        time: "4-күн",
        title: "Тоо күнү",
        body: "Көлгө көрүнүшү бар өрөөндө бир күндүк жөө жүрүш.",
      },
      {
        time: "5-күн",
        title: "Бишкекке кайтуу",
        body: "Көлдүн жанында жай эртең мененки убакыт жана кайра жол.",
      },
    ],
    whatToBring: [...kyrgyzBaseKit, "Купальник"],
  },
  "chon-kemin-valley-escape": {
    itinerary: [
      {
        time: "1-күн",
        title: "Чоң-Кеминге жол",
        body: "08:00дө Бишкектен чыгабыз. Өрөөнгө барып, үй-бүлөлүк конок үйүнө жайгашып, дарыянын боюнда сейилдейбиз.",
      },
      {
        time: "2-күн",
        title: "Токой жана жайлоо",
        body: "Карагайлуу токой жана жайлоодо эртең менен жай сейилдеп, түштөн кийин Бишкекке кайтабыз.",
      },
    ],
    whatToBring: kyrgyzOvernightKit,
  },
  "kegety-waterfall-hike": {
    itinerary: [
      {
        time: "07:00",
        title: "Бишкектен чыгуу",
        body: "Ала-Тоо аянтында жолугуп, Кегети капчыгайына барабыз.",
      },
      {
        time: "09:00",
        title: "Шаркыратмага жөө жүрүш",
        body: "Капчыгайдын ичине тоо суусун бойлой жай темпте басып, тыныгуу жана пикник кылабыз.",
      },
      { time: "18:00", title: "Бишкекке кайтуу", body: "Кечкисин Ала-Тоо аянтына кайтабыз." },
    ],
    whatToBring: kyrgyzBaseKit,
  },
  "suusamyr-jailoo-weekend": {
    itinerary: [
      {
        time: "1-күн",
        title: "Бишкек — Суусамыр",
        body: "08:00дө чыгабыз. Тоо-Ашуу ашуусу аркылуу боз үй лагерине жетип, кечки тамакка чейин жайлоодо сейилдейбиз.",
      },
      {
        time: "2-күн",
        title: "Жайлоодогу эртең менен",
        body: "Шашпай эртең мененки тамак, өрөөндө кыска сейил жана түштөн кийин Бишкекке кайтуу.",
      },
    ],
    whatToBring: [...kyrgyzOvernightKit, "Боз үй лагери үчүн ыңгайлуу кийим"],
  },
  "karakol-lakes-trek": {
    itinerary: [
      {
        time: "1-күн",
        title: "Каракол — бийик лагерь",
        body: "08:00дө Караколдон чыгабыз. Чыйырдын башына чейин барып, өрөөн менен лагерге көтөрүлөбүз.",
      },
      {
        time: "2-күн",
        title: "Бийик тоо көлдөрүнүн күнү",
        body: "Эң узак күн: кырдын алдындагы көлдөргө чейин барып, кайра лагерге кайтабыз.",
      },
      {
        time: "3-күн",
        title: "Караколго түшүү",
        body: "Лагерди жыйнап, өрөөн менен түшүп, түштөн кийин Караколго жетебиз.",
      },
    ],
    whatToBring: [
      ...kyrgyzOvernightKit,
      "Бутка кийилип көнгөн треккинг бут кийим",
      "Треккинг таяктары",
      "Жеке уктоочу баштык",
    ],
  },
  "burana-konorchek-day": {
    itinerary: [
      { time: "08:00", title: "Бишкектен чыгуу", body: "Ала-Тоо аянтында жолугуп, Чүй өрөөнү менен чыгышты карай жөнөйбүз." },
      { time: "10:00", title: "Бурана жана Баласагун", body: "Мунаранын аймагын жана ачык асман алдындагы таш эстеликтерди гид менен көрөбүз." },
      { time: "13:00", title: "Конорчек капчыгайы", body: "Капчыгайда жеңил сейил, пикник жана кызыл аскаларда сүрөткө түшүүгө убакыт." },
      { time: "18:00", title: "Бишкекке кайтуу", body: "Кечке жуук Ала-Тоо аянтына кайтабыз." },
    ],
    whatToBring: kyrgyzBaseKit,
  },
  "jeti-oguz-barskoon-escape": {
    itinerary: [
      { time: "1-күн", title: "Жети-Өгүздүн кызыл аскалары", body: "Караколдон баштап, «Жети бука» аскаларынын жанында сейилдеп, конок үйүнө жайгашабыз." },
      { time: "2-күн", title: "Барскоондун шаркыратмалары", body: "Эртең менен токой аркылуу шаркыратмаларга басып, түштөн кийин Караколго кайтабыз." },
    ],
    whatToBring: kyrgyzOvernightKit,
  },
  "arslanbob-walnut-forest": {
    itinerary: [
      { time: "1-күн", title: "Оштан Арстанбапка", body: "Ошто жолугуп, тоо айылына барабыз жана тосуп алуучу үй-бүлө менен таанышабыз." },
      { time: "2-күн", title: "Токой жана шаркыратма", body: "Жаңгак токоюнда жана Арстанбап шаркыратмаларындагы көрүнүш чекиттеринде жайбаракат сейил." },
      { time: "3-күн", title: "Айылдагы таң жана кайтуу", body: "Ошко кайтаар алдында айылда бош убакыт болот." },
    ],
    whatToBring: kyrgyzOvernightKit,
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

type TourSight = {
  icon: string;
  english: string;
  russian: string;
  kyrgyz: string;
};

// Fast visual summary for the tour detail page. This is deliberately concise:
// it complements the gallery and itinerary rather than repeating them.
const sightsByTour: Record<string, TourSight[]> = {
  "ala-archa-day-hike": [
    { icon: "🌲", english: "Juniper forest", russian: "Арчовый лес", kyrgyz: "Арча токою" },
    { icon: "🏔", english: "Glacier views", russian: "Виды на ледники", kyrgyz: "Мөңгүлөрдүн көрүнүшү" },
    { icon: "🌊", english: "Mountain river", russian: "Горная река", kyrgyz: "Тоо суусу" },
    { icon: "🥾", english: "Valley trail", russian: "Тропа по долине", kyrgyz: "Өрөөн чыйыры" },
  ],
  "song-kul-adventure": [
    { icon: "🏕", english: "Yurt camp", russian: "Юрточный лагерь", kyrgyz: "Боз үй лагери" },
    { icon: "🐎", english: "Horses", russian: "Лошади", kyrgyz: "Аттар" },
    { icon: "🌊", english: "Alpine lake", russian: "Высокогорное озеро", kyrgyz: "Бийик тоо көлү" },
    { icon: "🌄", english: "Jailoo", russian: "Джайлоо", kyrgyz: "Жайлоо" },
  ],
  "kel-suu-adventure": [
    { icon: "🏞", english: "Canyon lake", russian: "Озеро в каньоне", kyrgyz: "Капчыгайдагы көл" },
    { icon: "🗻", english: "Rock walls", russian: "Скальные стены", kyrgyz: "Аска-зоолор" },
    { icon: "🚙", english: "Mountain road", russian: "Горная дорога", kyrgyz: "Тоо жолу" },
    { icon: "⛺", english: "Remote camp", russian: "Удалённый лагерь", kyrgyz: "Алыскы лагерь" },
  ],
  "altyn-arashan-escape": [
    { icon: "♨️", english: "Hot springs", russian: "Горячие источники", kyrgyz: "Ысык булактар" },
    { icon: "🛖", english: "Mountain guesthouse", russian: "Горный гостевой дом", kyrgyz: "Тоо конок үйү" },
    { icon: "🌲", english: "Spruce valley", russian: "Еловая долина", kyrgyz: "Карагайлуу өрөөн" },
    { icon: "🏔", english: "Peak views", russian: "Виды на вершины", kyrgyz: "Чокулардын көрүнүшү" },
  ],
  "jyrgalan-mountain-trek": [
    { icon: "🌄", english: "Green ridges", russian: "Зелёные хребты", kyrgyz: "Жашыл кырлар" },
    { icon: "⛺", english: "High camp", russian: "Высокогорный лагерь", kyrgyz: "Бийик лагерь" },
    { icon: "🌲", english: "Spruce slopes", russian: "Еловые склоны", kyrgyz: "Карагайлуу капталдар" },
    { icon: "🥾", english: "Mountain pass", russian: "Горный перевал", kyrgyz: "Тоо ашуусу" },
  ],
  "issyk-kul-mountain-escape": [
    { icon: "🌊", english: "Lake shore", russian: "Берег озера", kyrgyz: "Көл жээги" },
    { icon: "🏜", english: "Red canyon", russian: "Красный каньон", kyrgyz: "Кызыл капчыгай" },
    { icon: "🏖", english: "Beach stops", russian: "Остановки на пляже", kyrgyz: "Жээктеги эс алуу" },
    { icon: "🏔", english: "Mountain trails", russian: "Горные тропы", kyrgyz: "Тоо чыйырлары" },
  ],
  "chon-kemin-valley-escape": [
    { icon: "🏡", english: "Family guesthouse", russian: "Семейный гостевой дом", kyrgyz: "Үй-бүлөлүк конок үйү" },
    { icon: "🌲", english: "Forest walks", russian: "Прогулки по лесу", kyrgyz: "Токойдогу сейил" },
    { icon: "🌊", english: "Riverside", russian: "Прогулки у реки", kyrgyz: "Дарыя жээгинде сейил" },
    { icon: "🐎", english: "Pastures", russian: "Пастбища", kyrgyz: "Жайлоолор" },
  ],
  "kegety-waterfall-hike": [
    { icon: "💧", english: "Waterfall", russian: "Водопад", kyrgyz: "Шаркыратма" },
    { icon: "🌲", english: "Mountain gorge", russian: "Горное ущелье", kyrgyz: "Тоо капчыгайы" },
    { icon: "🥾", english: "Day hike", russian: "Поход на один день", kyrgyz: "Бир күндүк жөө жүрүш" },
    { icon: "🧺", english: "Picnic stop", russian: "Пикник", kyrgyz: "Пикник" },
  ],
  "suusamyr-jailoo-weekend": [
    { icon: "🏕", english: "Yurts", russian: "Юрты", kyrgyz: "Боз үйлөр" },
    { icon: "🐎", english: "Horses", russian: "Лошади", kyrgyz: "Аттар" },
    { icon: "🌼", english: "Wildflowers", russian: "Полевые цветы", kyrgyz: "Жапайы гүлдөр" },
    { icon: "🏔", english: "Too-Ashuu pass", russian: "Перевал Тоо-Ашуу", kyrgyz: "Тоо-Ашуу ашуусу" },
  ],
  "karakol-lakes-trek": [
    { icon: "🏞", english: "Alpine lakes", russian: "Высокогорные озёра", kyrgyz: "Бийик тоо көлдөрү" },
    { icon: "⛺", english: "Trekking camp", russian: "Треккинговый лагерь", kyrgyz: "Треккинг лагери" },
    { icon: "🌲", english: "Spruce valley", russian: "Еловая долина", kyrgyz: "Карагайлуу өрөөн" },
    { icon: "🥾", english: "Multi-day trek", russian: "Многодневный трек", kyrgyz: "Көп күндүк трек" },
  ],
  "burana-konorchek-day": [
    { icon: "🏛", english: "Burana Tower", russian: "Башня Бурана", kyrgyz: "Бурана мунарасы" },
    { icon: "🏜", english: "Red canyon", russian: "Красный каньон", kyrgyz: "Кызыл капчыгай" },
    { icon: "🧺", english: "Picnic stop", russian: "Пикник", kyrgyz: "Пикник" },
    { icon: "🏔", english: "Valley views", russian: "Виды на долину", kyrgyz: "Өрөөндүн көрүнүшү" },
  ],
  "jeti-oguz-barskoon-escape": [
    { icon: "🪨", english: "Red cliffs", russian: "Красные скалы", kyrgyz: "Кызыл аскалар" },
    { icon: "💧", english: "Waterfalls", russian: "Водопады", kyrgyz: "Шаркыратмалар" },
    { icon: "🌲", english: "Spruce valley", russian: "Еловая долина", kyrgyz: "Карагайлуу өрөөн" },
    { icon: "🏡", english: "Guesthouse stay", russian: "Ночь в гостевом доме", kyrgyz: "Конок үйүндө түнөө" },
  ],
  "arslanbob-walnut-forest": [
    { icon: "🌳", english: "Walnut forest", russian: "Ореховый лес", kyrgyz: "Жаңгак токою" },
    { icon: "💧", english: "Waterfall", russian: "Водопад", kyrgyz: "Шаркыратма" },
    { icon: "🏡", english: "Village guesthouse", russian: "Сельский гостевой дом", kyrgyz: "Айылдык конок үйү" },
    { icon: "🥾", english: "Forest trail", russian: "Лесная тропа", kyrgyz: "Токой чыйыры" },
  ],
};

export function tourSights(slug: string, language: "en" | "ru" | "ky" = "en") {
  return (sightsByTour[slug] ?? []).map((sight) => ({
    icon: sight.icon,
    label:
      language === "ru" ? sight.russian : language === "ky" ? sight.kyrgyz : sight.english,
  }));
}
