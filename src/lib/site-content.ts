import type { Language } from "./i18n";

// Home page content. Guides and reviews are SAMPLE/DEMO data for the prototype —
// they are not real people or verified customers. Replace with real content before launch.

export type Guide = { name: string; role: string; bio: string; isSample: true };
export type Review = { name: string; from: string; tour: string; text: string; isSample: true };

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
    name: "Mei",
    from: "Singapore",
    tour: "Altyn-Arashan Escape",
    text: "I liked seeing exactly how many spots were left. The hot springs after the hike were perfect.",
    isSample: true,
  },
];

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

const russianReviews: Review[] = [
  {
    name: "София",
    from: "Германия",
    tour: "Приключение на Сон-Куле",
    text: "Бронирование заняло две минуты, и всё на странице полностью совпало с поездкой. Ночь в юрте стала лучшим моментом путешествия.",
    isSample: true,
  },
  {
    name: "Даниэль",
    from: "Великобритания",
    tour: "Поход в Ала-Арчу",
    text: "Отличный темп для разной по подготовке группы. Понятное место встречи, трансфер вовремя, а гид знал каждое растение и вершину.",
    isSample: true,
  },
  {
    name: "Мэй",
    from: "Сингапур",
    tour: "Отдых в Алтын-Арашане",
    text: "Мне понравилось, что сразу видно, сколько мест осталось. Горячие источники после похода были идеальны.",
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

export function siteContent(language: Language) {
  return language === "ru"
    ? { guides: russianGuides, reviews: russianReviews, faqs: russianFaqs }
    : { guides, reviews, faqs };
}
