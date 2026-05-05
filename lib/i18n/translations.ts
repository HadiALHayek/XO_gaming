export type Locale = "en" | "ar";

export const defaultLocale: Locale = "en";
export const localeCookieName = "xo_locale";

export const translations = {
  en: {
    brand: "XO Gaming",
    nav: { home: "Home", book: "Book", admin: "Admin", bookNow: "Book Now" },
    language: { english: "English", arabic: "العربية" },
    footer: { rights: "All rights reserved." },
    home: {
      badge: "No payment - reserve in seconds",
      heroLine1: "Plug in.",
      heroLine2: "Power up.",
      heroLine3: "Play at",
      heroDescription:
        "high-end gaming PCs and PlayStation 5 stations, ready when you are. Pick a device, choose your slot, and we will keep the lights on.",
      ctaBook: "Book a session",
      ctaAvailability: "View availability",
      liveAvailability: "Live availability",
      stations: "14 stations",
      sessions: "1-12 hour sessions",
      availableNow: "Available now",
      gamingPcs: "Gaming PCs",
      playstation: "PlayStation 5",
      liveDeviceStatus: "Live device status",
      snapshot:
        "A snapshot of the floor right now. Tap a device to see its schedule.",
      bookSlot: "Book a slot",
      noDevices: "No devices yet",
      noDevicesHint:
        "Run the database seed to create the 10 PCs and 4 PS5 stations.",
    },
    book: {
      title: "Book your session",
      subtitle:
        "Pick a device, drag to select a slot on the calendar (or type your times), and confirm. Reservations run from 1 to 12 hours.",
      reserveStation: "Reserve a station",
      reserveHint: "1 to 12 hour sessions. No payment required.",
      device: "Device",
      chooseDevice: "Choose a device",
      start: "Start",
      duration: "Duration (hours)",
      fullName: "Full name",
      phone: "Phone",
      discord: "Discord (optional)",
      notes: "Notes (optional)",
      notesPlaceholder: "Anything we should know?",
      booking: "Booking...",
      confirm: "Confirm reservation",
      noDevicesConfigured: "No devices configured. Run the seed script and refresh.",
      reserved: "Reserved",
      maintenance: "Maintenance",
      dragToSelect: "Drag to select a slot on the calendar",
      timeSlotSelected: "Time slot selected",
      bookingFailed: "Booking failed",
      reservationConfirmed: "Reservation confirmed!",
      seeYouSoon: "We'll see you soon at XO Gaming.",
      bookingSummary: "Booking",
      from: "from",
      to: "to",
    },
    admin: {
      restricted: "Restricted area for XO Gaming staff.",
      overviewHint: "What is happening at XO Gaming right now.",
    },
  },
  ar: {
    brand: "XO Gaming",
    nav: { home: "الرئيسية", book: "الحجز", admin: "الإدارة", bookNow: "احجز الآن" },
    language: { english: "English", arabic: "العربية" },
    footer: { rights: "جميع الحقوق محفوظة." },
    home: {
      badge: "بدون دفع - احجز خلال ثوانٍ",
      heroLine1: "شبّك جهازك.",
      heroLine2: "ارفع المستوى.",
      heroLine3: "العب في",
      heroDescription:
        "أجهزة ألعاب PC عالية الأداء وبلايستيشن 5 جاهزة لك. اختر الجهاز والوقت واحجز بسهولة.",
      ctaBook: "احجز جلسة",
      ctaAvailability: "عرض التوفر",
      liveAvailability: "توفر مباشر",
      stations: "14 محطة",
      sessions: "جلسات من 1 إلى 12 ساعة",
      availableNow: "المتاح الآن",
      gamingPcs: "أجهزة PC",
      playstation: "بلايستيشن 5",
      liveDeviceStatus: "حالة الأجهزة المباشرة",
      snapshot: "نظرة سريعة على الصالة الآن. اضغط على جهاز لرؤية الجدول.",
      bookSlot: "احجز موعدًا",
      noDevices: "لا توجد أجهزة بعد",
      noDevicesHint: "شغّل ملف التهيئة لإضافة 10 أجهزة PC و4 أجهزة PS5.",
    },
    book: {
      title: "احجز جلستك",
      subtitle:
        "اختر الجهاز، اسحب لتحديد الوقت في التقويم (أو أدخل الوقت يدويًا)، ثم أكّد الحجز. مدة الحجز من ساعة إلى 12 ساعة.",
      reserveStation: "احجز محطة",
      reserveHint: "من 1 إلى 12 ساعة. بدون دفع.",
      device: "الجهاز",
      chooseDevice: "اختر جهازًا",
      start: "وقت البداية",
      duration: "المدة (بالساعات)",
      fullName: "الاسم الكامل",
      phone: "الهاتف",
      discord: "ديسكورد (اختياري)",
      notes: "ملاحظات (اختياري)",
      notesPlaceholder: "هل لديك أي ملاحظات؟",
      booking: "جارٍ الحجز...",
      confirm: "تأكيد الحجز",
      noDevicesConfigured: "لا توجد أجهزة مهيأة. شغّل ملف التهيئة ثم حدّث الصفحة.",
      reserved: "محجوز",
      maintenance: "صيانة",
      dragToSelect: "اسحب لتحديد الوقت من التقويم",
      timeSlotSelected: "تم تحديد الوقت",
      bookingFailed: "فشل الحجز",
      reservationConfirmed: "تم تأكيد الحجز!",
      seeYouSoon: "نراك قريبًا في XO Gaming.",
      bookingSummary: "حجز",
      from: "من",
      to: "إلى",
    },
    admin: {
      restricted: "منطقة مخصصة لموظفي XO Gaming فقط.",
      overviewHint: "ما الذي يحدث الآن في XO Gaming.",
    },
  },
} as const;

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "ar";
}

