import type { Language } from "./i18n";

// Home page content. Guides and reviews are SAMPLE/DEMO data for the prototype —
// they are not real people or verified customers. Replace with real content before launch.

export type Guide = { name: string; role: string; bio: string; isSample: true };
export type Review = { name: string; from: string; tour: string; text: string; isSample: true };
export type TourReview = { name: string; from: string; text: string; isSample: true };
export type TourRating = {
  rating: number;
  count: number;
  reviews: TourReview[];
  isSample: true;
};

export type ReviewTimestamp = { date: string; time: string };

const REVIEW_MONTHS = [3, 4, 5, 6, 7, 8, 9, 10] as const;
const REVIEW_MINUTES = ["00", "08", "15", "22", "30", "38", "45", "52"] as const;

/** Stable demo review times: March–October avoids the winter season. */
export function reviewTimestamp(slug: string, index: number): ReviewTimestamp {
  const hash = Array.from(`${slug}-${index}`).reduce(
    (total, character) => (total * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
  const month = REVIEW_MONTHS[hash % REVIEW_MONTHS.length]!;
  const day = ((hash >>> 3) % 27) + 1;
  const hour = 9 + ((hash >>> 7) % 12);
  const minute = REVIEW_MINUTES[(hash >>> 11) % REVIEW_MINUTES.length]!;

  return {
    date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    time: `${String(hour).padStart(2, "0")}:${minute}`,
  };
}

export const guides: Guide[] = [
  {
    name: "Azamat",
    role: "Founder & lead guide",
    bio: "Grew up in Bishkek and has spent his weekends in these valleys for years. Plans every route himself and leads most trips.",
    isSample: true,
  },
  {
    name: "Aigerim",
    role: "Trek guide (sample profile)",
    bio: "Leads the multi-day treks and yurt trips. Knows the herding families who host our camps.",
    isSample: true,
  },
  {
    name: "Bakyt",
    role: "Driver & logistics (sample profile)",
    bio: "Gets everyone to the trailhead and back safely, on asphalt and mountain tracks alike.",
    isSample: true,
  },
];

// A review is a guest's original statement, not interface copy. Keep the whole
// record in the author's language: international guests in English and guests
// from the CIS in Russian. Never translate reviews on a language switch.
export const reviews: Review[] = [
  {
    name: "Sofia",
    from: "Germany",
    tour: "Song-Kul Adventure",
    text: "Booking took two minutes and everything on the page was exactly what we got. The yurt night was the highlight of our trip.",
    isSample: true,
  },
  {
    name: "Daniel",
    from: "United Kingdom",
    tour: "Ala-Archa Day Hike",
    text: "Great pace for a mixed group. Clear meeting point, on-time pick-up, and the guide knew every plant and peak.",
    isSample: true,
  },
  {
    name: "Айдана",
    from: "Казахстан",
    tour: "Побег в Алтын-Арашан",
    text: "Очень удобно, что заранее видно, сколько мест осталось. После похода горячие источники были именно тем, что нужно.",
    isSample: true,
  },
];

// Per-tour ratings and feedback are also SAMPLE/DEMO data. Review language is
// intentionally preserved: English for international guests and Russian for CIS guests.
export const tourRatings: Record<string, TourRating> = {
  "ala-archa-day-hike": {
    rating: 4.9,
    count: 142,
    reviews: [
      {
        name: "Айпери",
        from: "Кыргызстан",
        text: "Бишкекке жакын жердеги биринчи жөө жүрүшүм абдан жакты. Күтүлгөндөн көбүрөөк токтодук, бирок ошондо эч ким артта калган жок. Жалгыз барсам да, биринчи мүнөттөрдөн тартып өзүмдү топтун бир бөлүгү сездим. Мөңгүнү карап чай ичкен тыныгуу өзгөчө эсимде калды.",
        isSample: true,
      },
      {
        name: "Илья",
        from: "Казахстан",
        text: "Отличный вариант на один день: чёткий тайминг, понятная точка встречи и очень красивые виды на ледники.",
        isSample: true,
      },
      {
        name: "Бектур",
        from: "Кыргызстан",
        text: "Жалгыз барууга да ыңгайлуу тур экен. Маршрут кызыктуу, ошол эле учурда өрөөндүн кооздугун көрүп, токтоп эс алууга убакыт болду.",
        isSample: true,
      },
      {
        name: "Алия",
        from: "Кыргызстан",
        text: "Ходили с друзьями впервые. Фотки — вау.",
        isSample: true,
      },
      {
        name: "Владимир",
        from: "Россия",
        text: "Внимательный гид и по-настоящему красивый маршрут. Это стало главным впечатлением от нашей короткой поездки в Бишкек.",
        isSample: true,
      },
      {
        name: "Виктор",
        from: "Россия",
        text: "Не ожидал настолько серьёзных гор всего в часе от города. Хорошая организация от старта до возвращения.",
        isSample: true,
      },
    ],
    isSample: true,
  },
  "song-kul-adventure": {
    rating: 4.8,
    count: 96,
    reviews: [
      {
        name: "Айсана",
        from: "Кыргызстан",
        text: "Боз үй лагери, көл жана ашуу аркылуу узак жол — баары эсте калды. Унаада узак отурдук, бирок толук арзыйт. Күн батардын алдында келдик, көл таптакыр башкача көрүнөт экен. Үй ээлери бизди дароо жылуу тосуп алышты.",
        isSample: true,
      },
      {
        name: "Тимур",
        from: "Узбекистан",
        text: "Сон-Куль оказался даже красивее фотографий. Ночёвка в юрте и ужин у семьи пастухов — самое сильное впечатление.",
        isSample: true,
      },
      {
        name: "Мирбек",
        from: "Кыргызстан",
        text: "Ачык талаа менен көлдүн көрүнүшү укмуш экен. Дагы баргым келет.",
        isSample: true,
      },
      {
        name: "Руслан",
        from: "Кыргызстан",
        text: "Поездка получилась настоящей перезагрузкой. Вечером у озера тихо, звёзд много, а утром свет вообще другой. Красота.",
        isSample: true,
      },
      {
        name: "Sophie",
        from: "Germany",
        text: "Everything was clear from booking through to the return journey. A very special place and a kind team.",
        isSample: true,
      },
    ],
    isSample: true,
  },
  "kel-suu-adventure": {
    rating: 4.9,
    count: 72,
    reviews: [
      {
        name: "Элнура",
        from: "Кыргызстан",
        text: "Алыс жайгашканы бул жердин эң жакшы жагы экен. Уруксат кагаздары тууралуу маалымат алдын ала так берилди, жол жана уюштуруу да жайбаракат өттү. Чек арадагы документтерден бир аз чочулаганбыз, бирок команда жөнөткөн тизмеден кийин баары күткөндөн жеңил болду.",
        isSample: true,
      },
      {
        name: "Арсен",
        from: "Кыргызстан",
        text: "Маршрут непростой, но организован очень аккуратно. Озеро стоит долгой дороги.",
        isSample: true,
      },
      {
        name: "Кубаныч",
        from: "Кыргызстан",
        text: "Бул оңой тур эмес, муну жашырбай эле коюш керек. Бирок команда баарын так түшүндүрүп, топту бирге кармады.",
        isSample: true,
      },
      {
        name: "Гульназ",
        from: "Казахстан",
        text: "Всё было продумано до мелочей: документы, дорога, остановки, размещение. Место правда уникальное, фотки не передают.",
        isSample: true,
      },
      {
        name: "Marco",
        from: "Italy",
        text: "The scale of the lake and cliffs is impossible to show in a photo. Worth every kilometre of the journey.",
        isSample: true,
      },
    ],
    isSample: true,
  },
  "altyn-arashan-escape": {
    rating: 4.8,
    count: 118,
    reviews: [
      {
        name: "Назгүл",
        from: "Кыргызстан",
        text: "Өрөөн абдан тынч экен. Күн бою баскандан кийин ысык булактар бутка дал келген эс алуу болду. Биз бат эле токтойбуз деп ойлогонбуз, бирок дарыянын жээгинде көпкө отуруп, түштөн кийинки планыбызды өзгөрттүк. Такыр өкүнгөн жокпуз.",
        isSample: true,
      },
      {
        name: "Алина",
        from: "Россия",
        text: "Очень атмосферный маршрут: домики, река, горячие источники и потрясающая долина. Уезжать совсем не хотелось.",
        isSample: true,
      },
      {
        name: "Жибек",
        from: "Кыргызстан",
        text: "Өрөөн да, ысык булактар да сонун.",
        isSample: true,
      },
      {
        name: "Евгений",
        from: "Казахстан",
        text: "Долина очень зелёная и уютная, а горячие источники после тропы — лучшее завершение дня.",
        isSample: true,
      },
      {
        name: "Amelia",
        from: "Australia",
        text: "A lovely escape from the busier parts of Issyk-Kul. I would happily do this route again.",
        isSample: true,
      },
      {
        name: "Ксения",
        from: "Россия",
        text: "Очень красивое место для неспешной поездки. Организация понятная, а после источников совсем не хочется уезжать.",
        isSample: true,
      },
    ],
    isSample: true,
  },
  "jyrgalan-mountain-trek": {
    rating: 4.9,
    count: 64,
    reviews: [
      {
        name: "Сергей",
        from: "Казахстан",
        text: "Три совершенно разных дня и очень большие виды. День на хребте дался непросто, но в итоге точно того стоил. Советую взять одежду слоями: за один день у нас были солнце, ветер и небольшой дождь. При этом не было ни спешки, ни чувства, что кто-то остаётся без внимания.",
        isSample: true,
      },
      {
        name: "Диана",
        from: "Казахстан",
        text: "Понравился темп: можно было идти в своём ритме, а гид всё время следил, чтобы группа не растягивалась.",
        isSample: true,
      },
      {
        name: "Наргиза",
        from: "Кыргызстан",
        text: "Кыркадан ачылган көрүнүштөр абдан күчтүү. Чыныгы тоо треги экен.",
        isSample: true,
      },
      {
        name: "Азиза",
        from: "Узбекистан",
        text: "Для меня это был первый трёхдневный трек. Ноги, конечно, устали :) Но с гидом было спокойно и безопасно.",
        isSample: true,
      },
      {
        name: "Lucas",
        from: "Belgium",
        text: "Jyrgalan was quieter than expected in the best way. Wide valleys, strong routes and very welcoming locals.",
        isSample: true,
      },
    ],
    isSample: true,
  },
  "issyk-kul-mountain-escape": {
    rating: 4.7,
    count: 105,
    reviews: [
      {
        name: "Каныкей",
        from: "Кыргызстан",
        text: "Көл жээгиндеги эс алуу, жеңил басуу жана тоо көрүнүштөрү жакшы айкалышкан. Бир жерден экинчи жерге шашып жаткандай сезилген жок. Ар бир түнөгөн жердин өз маанайы бар экен, ошондуктан сапар кайталанма болгон жок. Бизге капчыгайдагы күн күтүлбөгөндөй эң жакты.",
        isSample: true,
      },
      {
        name: "Сабина",
        from: "Узбекистан",
        text: "За пять дней увидели совсем разный Иссык-Куль. Не перегружено.",
        isSample: true,
      },
      {
        name: "Тилек",
        from: "Кыргызстан",
        text: "Аймак менен таанышууга эң сонун сапар. Ар бир күн башкача өттү, көргөндөрдү шашпай кабыл алууга бош убакыт да жетиштүү болду.",
        isSample: true,
      },
      {
        name: "Данияр",
        from: "Кыргызстан",
        text: "Хорошо собранный маршрут: и озеро посмотрели, и в ущельях погуляли. Подходит для отдыха без спешки.",
        isSample: true,
      },
      {
        name: "Элина",
        from: "Кыргызстан",
        text: "Көл жээгинен бийик өрөөндөргө чейин көрүнүш дайыма өзгөрүп турду. Бир сапар эмес, бир нече саякаттай сезилди.",
        isSample: true,
      },
      {
        name: "Азамат",
        from: "Кыргызстан",
        text: "Отличный маршрут, чтобы увидеть Иссык-Куль с разных сторон. Всё прошло спокойно и без лишней суеты.",
        isSample: true,
      },
    ],
    isSample: true,
  },
  "chon-kemin-valley-escape": {
    rating: 4.8,
    count: 58,
    reviews: [
      {
        name: "Ольга",
        from: "Россия",
        text: "Семейный гостевой дом сделал эту поездку особенной. Неспешные прогулки, хорошая еда и зелёная долина недалеко от Бишкека. После нескольких насыщенных дней в городе нам как раз не хватало такого спокойного отдыха — свежего воздуха и тёплого приёма.",
        isSample: true,
      },
      {
        name: "Нурбек",
        from: "Кыргызстан",
        text: "Спокойная поездка без сложного треккинга. Очень уютно.",
        isSample: true,
      },
      {
        name: "Эрмек",
        from: "Кыргызстан",
        text: "Жашыл өрөөн жана конок үйдөгү меймандостук дем алышты абдан тынч өткөрүүгө шарт түздү. Дал ушундай эс алуу керек болчу.",
        isSample: true,
      },
      {
        name: "Оксана",
        from: "Россия",
        text: "Очень тёплая атмосфера и красивая долина. Понравилось, что маршрут не требует специальной подготовки.",
        isSample: true,
      },
      {
        name: "Noah",
        from: "Netherlands",
        text: "A gentle, well-paced trip with beautiful countryside and excellent home-cooked food.",
        isSample: true,
      },
    ],
    isSample: true,
  },
  "kegety-waterfall-hike": {
    rating: 4.7,
    count: 89,
    reviews: [
      {
        name: "Айсулуу",
        from: "Кыргызстан",
        text: "Шаардын сыртында бир күн өткөрүү абдан сергитти. Шаркыратма кооз, ал эми гид жергиликтүү майда окуяларды да көп айтып берди. Бул өрөөндү мурда билчү эмеспиз, ошондуктан ошол баяндар маршрутту жөн гана жол менен жүрүүдөн алда канча кызыктуу кылды.",
        isSample: true,
      },
      {
        name: "Алексей",
        from: "Россия",
        text: "Хороший маршрут на выходной: дорога недолгая, тропа понятная, а у водопада можно спокойно посидеть и отдохнуть.",
        isSample: true,
      },
      {
        name: "Медер",
        from: "Кыргызстан",
        text: "Жакшы күн болду. Шаркыратмага жеткенге арзыйт.",
        isSample: true,
      },
      {
        name: "Марат",
        from: "Казахстан",
        text: "Отличный вариант для первого похода рядом с Бишкеком. Инструкции по дороге и сбору были очень понятными.",
        isSample: true,
      },
      {
        name: "Isabel",
        from: "Spain",
        text: "The trail was scenic and manageable, and the group had a friendly, relaxed energy throughout.",
        isSample: true,
      },
    ],
    isSample: true,
  },
  "suusamyr-jailoo-weekend": {
    rating: 4.8,
    count: 47,
    reviews: [
      {
        name: "Самат",
        from: "Кыргызстан",
        text: "Кең талаалар жана боз үй лагериндеги чын дилден тосуп алуу менен тынч дем алыш болду. Ашууда шамалдуу экен, кошумча күрмө алганыбыз жакшы болуптур. Бирок боз үйдөгү кеч абдан жылуу, эртең мененки көрүнүш болсо жомоктогудай сезилди.",
        isSample: true,
      },
      {
        name: "Мадина",
        from: "Казахстан",
        text: "Идеальный формат на выходные. Ночёвка в юрте — отдельное впечатление.",
        isSample: true,
      },
      {
        name: "Бурул",
        from: "Кыргызстан",
        text: "Асман кең, жайыттар тынч, боз үй лагериндеги тосуп алуу абдан жылуу болду. Шаардан чыгып эс алууга мыкты дем алыш экен.",
        isSample: true,
      },
      {
        name: "Айгуль",
        from: "Кыргызстан",
        text: "Очень красивый джайлоо, особенно на закате. Формат короткий, но впечатлений хватает надолго.",
        isSample: true,
      },
      {
        name: "Clara",
        from: "Austria",
        text: "The drive itself was spectacular and the camp felt peaceful and authentic without being uncomfortable.",
        isSample: true,
      },
    ],
    isSample: true,
  },
  "karakol-lakes-trek": {
    rating: 4.9,
    count: 53,
    reviews: [
      {
        name: "Акылай",
        from: "Кыргызстан",
        text: "Аба ырайы бат-бат өзгөрсө да, бийик тоодогу көлдөр укмуш болду. Бул чыныгы трек, ошондуктан алдын ала даярдануу керек. Бут кийимибиз ылай болуп, көтөрүлүш оңой болгон жок, бирок лагердеги кечтер менен көрүнүштөр баарына арзытты. Борбордук Азияда барган эң жакшы маршруттарымдын бири.",
        isSample: true,
      },
      {
        name: "Жанна",
        from: "Кыргызстан",
        text: "Самый красивый многодневный маршрут из тех, что я пробовала. Озёра, лес и высокие перевалы — всё в одной поездке. Очень советую!",
        isSample: true,
      },
      {
        name: "Нурлан",
        from: "Кыргызстан",
        text: "Көлдөрү кооз, көтөрүлүштөрү кызыктуу чыныгы трек. Башынан аягына чейин күнүмдүк темп жакшы тандалган.",
        isSample: true,
      },
      {
        name: "Михаил",
        from: "Россия",
        text: "Маршрут требует сил, но виды того стоят.",
        isSample: true,
      },
      {
        name: "Ava",
        from: "United States",
        text: "Challenging in the right way and wonderfully remote. I felt very well looked after by the team.",
        isSample: true,
      },
    ],
    isSample: true,
  },
};

export function tourRating(slug: string) {
  return tourRatings[slug];
}

export const faqs: { q: string; a: string }[] = [
  {
    q: "How do I book?",
    a: "Choose a tour, pick an open date and the number of guests, add your contact details and confirm. You get a booking reference straight away.",
  },
  {
    q: "Which dates are available?",
    a: "Each tour page lists upcoming departures with their start time and status: Available, Few spots left or Fully booked. Fully booked dates can't be selected.",
  },
  {
    q: "How big are the groups?",
    a: "Small. Each tour has a maximum group size shown on its page — usually 8 guests or fewer.",
  },
  {
    q: "Where do we meet?",
    a: "The meeting point is listed on every tour page and in your booking confirmation. Please arrive 15 minutes before the start time.",
  },
  {
    q: "What should I bring?",
    a: "Good hiking shoes, warm and waterproof layers, sun protection and water. Every tour page has a full packing list.",
  },
  {
    q: "What if the weather is bad?",
    a: "Mountain weather changes quickly. If conditions make a route unsafe, the guide may adjust the route or move the trip to another date.",
  },
  {
    q: "Can I cancel or change my date?",
    a: "Yes. Please let us know at least 48 hours before departure so we can offer the spot to someone else.",
  },
  {
    q: "How do I pay?",
    a: "No payment is taken online. You pay the guide on the day of the trip.",
  },
];

const russianGuides: Guide[] = [
  {
    name: "Азамат",
    role: "Основатель и ведущий гид",
    bio: "Вырос в Бишкеке и много лет проводит выходные в этих долинах. Сам планирует каждый маршрут и ведёт большинство поездок.",
    isSample: true,
  },
  {
    name: "Айгерим",
    role: "Гид по трекингам (демо-профиль)",
    bio: "Ведёт многодневные походы и поездки в юрточные лагеря. Знает семьи пастухов, принимающие наших гостей.",
    isSample: true,
  },
  {
    name: "Бакыт",
    role: "Водитель и логистика (демо-профиль)",
    bio: "Безопасно доставляет гостей к началу маршрута и обратно — и по асфальту, и по горным дорогам.",
    isSample: true,
  },
];

const russianFaqs: { q: string; a: string }[] = [
  {
    q: "Как забронировать тур?",
    a: "Выберите тур, свободную дату и количество гостей, оставьте контакты и подтвердите бронирование. Код бронирования придёт сразу.",
  },
  {
    q: "Какие даты доступны?",
    a: "На странице каждого тура указаны ближайшие выезды, время начала и статус: «Есть места», «Осталось мало мест» или «Мест нет». Полные даты выбрать нельзя.",
  },
  {
    q: "Какие размеры групп?",
    a: "Небольшие. Максимальное количество гостей указано на странице каждого тура — обычно не более восьми человек.",
  },
  {
    q: "Где мы встречаемся?",
    a: "Точка встречи есть на странице тура и в подтверждении бронирования. Пожалуйста, приходите за 15 минут до начала.",
  },
  {
    q: "Что взять с собой?",
    a: "Удобную обувь для похода, тёплую и непромокаемую одежду, защиту от солнца и воду. Полный список есть на странице каждого тура.",
  },
  {
    q: "Что будет при плохой погоде?",
    a: "Погода в горах быстро меняется. Если маршрут становится небезопасным, гид может изменить его или перенести поездку на другую дату.",
  },
  {
    q: "Можно отменить или перенести дату?",
    a: "Да. Сообщите нам минимум за 48 часов до выезда, чтобы место мог занять другой гость.",
  },
  {
    q: "Как оплатить?",
    a: "Онлайн-оплаты нет. Вы платите гиду в день поездки.",
  },
];

const kyrgyzGuides: Guide[] = [
  {
    name: "Азамат",
    role: "Негиздөөчү жана башкы гид",
    bio: "Бишкекте чоңойгон жана бул өрөөндөрдө көп жылдан бери дем алышын өткөрөт. Ар бир маршрутту өзү пландап, көпчүлүк сапарларды жетектейт.",
    isSample: true,
  },
  {
    name: "Айгерим",
    role: "Треккинг гид (демо-профиль)",
    bio: "Көп күндүк жөө жүрүштөрдү жана боз үй лагерлерине сапарларды жетектейт. Конокторду кабыл алган койчу үй-бүлөлөрдү жакшы билет.",
    isSample: true,
  },
  {
    name: "Бакыт",
    role: "Айдоочу жана логистика (демо-профиль)",
    bio: "Конокторду чыйырдын башына жана кайра коопсуз жеткирет — асфальтта да, тоо жолунда да.",
    isSample: true,
  },
];

const kyrgyzFaqs: { q: string; a: string }[] = [
  {
    q: "Турду кантип брондойм?",
    a: "Турду, бош датаны жана коноктордун санын тандаңыз, байланыш маалыматыңызды жазыңыз жана ырастаңыз. Брондоо коду дароо чыгат.",
  },
  {
    q: "Кайсы даталар жеткиликтүү?",
    a: "Ар бир турдун барагында жакынкы чыгуу даталары, башталыш убактысы жана абалы көрсөтүлөт: бош орун бар, аз орун калды же орун жок. Толгон даталарды тандоого болбойт.",
  },
  {
    q: "Топтор канчалык чоң?",
    a: "Чакан. Ар бир турдун барагында максималдуу конок саны көрсөтүлөт — адатта сегиз адамдан ашпайт.",
  },
  {
    q: "Кайсы жерде жолугабыз?",
    a: "Жолугушуу жери турдун барагында жана брондоону ырастоодо жазылат. Башталардан 15 мүнөт мурун келишиңизди суранабыз.",
  },
  {
    q: "Өзүм менен эмне алам?",
    a: "Ыңгайлуу тоо бут кийимин, жылуу жана суу өткөрбөгөн кийимди, күндөн коргонуу каражаттарын жана сууну алыңыз. Толук тизме ар бир турдун барагында бар.",
  },
  {
    q: "Аба ырайы начар болсо эмне болот?",
    a: "Тоодо аба ырайы тез өзгөрөт. Маршрут кооптуу болуп калса, гид аны өзгөртүшү же сапарды башка күнгө жылдырышы мүмкүн.",
  },
  {
    q: "Датаны жокко чыгара же өзгөртө аламбы?",
    a: "Ооба. Орунду башка конокко сунуштай алышыбыз үчүн кетерден кеминде 48 саат мурун кабарлаңыз.",
  },
  {
    q: "Кантип төлөйм?",
    a: "Онлайн төлөм жок. Сапар болгон күнү гидге төлөйсүз.",
  },
];

export function siteContent(language: Language) {
  if (language === "ru") return { guides: russianGuides, reviews, faqs: russianFaqs };
  if (language === "ky") return { guides: kyrgyzGuides, reviews, faqs: kyrgyzFaqs };
  return { guides, reviews, faqs };
}
