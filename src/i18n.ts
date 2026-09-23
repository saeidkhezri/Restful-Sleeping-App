export type Lang = "fa" | "en";

export const DEDICATION =
  "Made by Mohammadsaeid Khezripour for his dear father, Mr. Ahmad Khezripour";

const fa = {
  brand: "نگهبان خواب",
  tagline: "محافظ خوابِ شبانه‌ی شما",

  // language screen
  langTitle: "زبان خود را انتخاب کنید",
  langDesc: "بعداً هر وقت خواستید، از صفحه اصلی قابل تغییر است",
  faName: "فارسی",
  faSub: "ادامه به زبان فارسی",
  enName: "English",
  enSub: "Continue in English",

  // permissions
  permTitle: "دسترسی‌ها",
  permDesc: "نگهبان خواب برای محافظت از شما به این دسترسی‌ها نیاز دارد",
  permMic: "میکروفون",
  permMicDesc: "شنیدن صدای شما هنگام کابوس",
  permNotify: "اعلان‌ها",
  permNotifyDesc: "نمایش هشدار و وضعیت نگهبان",
  permAuto: "خودکار",
  grantedBadge: "فعال شد",
  grantBtn: "فعال‌سازی دسترسی‌ها",
  grantFail: "اجازه صادر نشد",
  permDenied: "بدون میکروفون، نگهبان نمی‌تواند صدایتان را بشنود",
  continueBtn: "ادامه",

  // home
  statusReady: "آماده‌ی نگهبانی",
  statusSetup: "نیازمند تنظیم",
  voiceTitle: "تن صدای من",
  voiceDesc: "با دو نمونه‌ی کوتاه، نگهبان صدای شما را می‌شناسد",
  sentenceChip: "جمله",
  humChip: "هوم‌هوم",
  recordBtn: "ثبت صدا",
  reRecordBtn: "بازتنظیم",
  doneBadge: "انجام شد",
  pendingBadge: "باقی‌مانده",
  alarmTitle: "صدای هشدار",
  alarmDesc: "صدایی که شما را بیدار می‌کند",
  customFromPhone: "انتخاب از حافظه‌ی گوشی",
  pickAudioHint: "هر فایل صوتی قابل پخش",
  vibrateTitle: "لرزش هشدار",
  vibrateDesc: "لرزش قوی تا لحظه‌ی خاموش شدن",
  guardBtn: "شروع نگهبانی",
  guardNeedVoice: "نخست تن صدای خود را ثبت کنید",
  langLabel: "زبان",
  exitLabel: "خروج",
  exitHint: "خاموش کردن کامل نگهبان",
  bgHint: "اگر بدون خروج ببندید، نگهبان در پس‌زمینه بیدار می‌ماند",
  sampleOf: "انتخاب شده",

  // recording modal
  stepOf: (n: number) => `مرحله ${toFaDigits(n)} از ۲`,
  s1Title: "جمله‌ی معرفی",
  s1Desc: "آرام و نزدیک میکروفون بخوانید:",
  s1Line: "من احمد خضری پور هستم",
  s2Title: "صدای هوم‌هوم",
  s2Desc: "همان صدایی که هنگام کابوس می‌سازید:",
  s2Line: "هوم هوم",
  tapStart: "برای شروع، میکروفون را لمس کنید",
  tapStop: "در حال ضبط… برای پایان لمس کنید",
  analyzing: "در حال شناخت تن صدا…",
  savedTitle: "تن صدا ثبت شد",
  retryTitle: "صدا به‌خوبی شناسایی نشد",
  retryTooShort: "ضبط خیلی کوتاه بود، کمی طولانی‌تر بخوانید",
  retryTooQuiet: "صدا خیلی آرام بود، کمی بلندتر",
  retryUnstable: "صدای پایدار «هوم هوم» شناسایی نشد",
  retryPitch: "لحن صدا تشخیص داده نشد، دوباره بخوانید",
  tryAgain: "دوباره تلاش کنید",
  nextStep: "مرحله بعد",
  finish: "پایان",
  allDoneTitle: "نگهبان صدایتان را آموخت",
  allDoneDesc: "از همین حالا، با شنیدن صدای شما هشدار فعال می‌شود",
  micFailTitle: "میکروفون در دسترس نیست",
  micFailDesc: "اجازه‌ی دسترسی به میکروفون را بدهید و دوباره تلاش کنید",
  backLabel: "بازگشت",

  // alarm sheet
  sheetTitle: "صدای هشدار",
  sheetDesc: "پیش‌نمایش بشنوید و انتخاب کنید",
  alarmNames: {
    dawn: "سپیده‌دم",
    bell: "زنگ کلاسیک",
    pulse: "پالس بیدارباش",
    moon: "ماه‌تاب",
    meteor: "شهاب‌سنگ",
  } as Record<string, string>,
  myFile: "فایل من",
  browseFile: "انتخاب فایل صوتی…",
  closeLabel: "بستن",

  // monitor
  monTitle: "نگهبان بیدار است",
  monDesc: "آرام بخوابید؛ ما به صدای شما گوش می‌دهیم",
  calibrating: "هماهنگی با سکون اتاق…",
  listening: "در حال شنیدن",
  heardYou: "صدای شما!",
  stopGuard: "پایان نگهبانی",
  screenOffOk:
    "می‌توانید صفحه را تاریک کنید؛ نگهبان در پس‌زمینه بیدار می‌ماند",
  alarmWith: (name: string) => `هشدار: ${name}`,
  levelLabel: "صدای محیط",

  // ringing
  wakeTitle: "بیدار شو!",
  wakeSub: "نگهبان صدای شما را شنید",
  dismiss: "بیدار شدم",
  ringingNote: "تا لمس دکمه، هشدار ادامه دارد",
  resumed: "نگهبان دوباره بیدار شد",

  // exit
  exitTitle: "شب‌خوش و باتوفیق",
  exitDesc: "نگهبان خواب کاملاً خاموش شد",
  relaunch: "اجرا مجدد",
};

export type Dict = typeof fa;

const en: Dict = {
  brand: "Dream Guardian",
  tagline: "Your guardian through the night",

  langTitle: "Choose your language",
  langDesc: "You can change it anytime from the home screen",
  faName: "فارسی",
  faSub: "ادامه به زبان فارسی",
  enName: "English",
  enSub: "Continue in English",

  permTitle: "Permissions",
  permDesc: "The guardian needs these permissions to watch over your sleep",
  permMic: "Microphone",
  permMicDesc: "Hearing your voice during nightmares",
  permNotify: "Notifications",
  permNotifyDesc: "Showing guardian alerts and status",
  permAuto: "Automatic",
  grantedBadge: "Granted",
  grantBtn: "Grant permissions",
  grantFail: "Permission denied",
  permDenied: "Without the microphone, the guardian can't hear you",
  continueBtn: "Continue",

  statusReady: "Ready to guard",
  statusSetup: "Setup needed",
  voiceTitle: "My Voice Tone",
  voiceDesc: "Two short samples teach the guardian your voice",
  sentenceChip: "Sentence",
  humChip: "Humming",
  recordBtn: "Record",
  reRecordBtn: "Re-record",
  doneBadge: "Done",
  pendingBadge: "Pending",
  alarmTitle: "Alarm Sound",
  alarmDesc: "The sound that wakes you up",
  customFromPhone: "Pick from phone storage",
  pickAudioHint: "Any playable audio file",
  vibrateTitle: "Alarm Vibration",
  vibrateDesc: "Strong vibration until dismissed",
  guardBtn: "Start Guarding",
  guardNeedVoice: "Record your voice tone first",
  langLabel: "Language",
  exitLabel: "Exit",
  exitHint: "Completely shut the guardian down",
  bgHint: "If you close without exiting, the guardian stays awake in the background",
  sampleOf: "Selected",

  stepOf: (n: number) => `Step ${n} of 2`,
  s1Title: "Intro Sentence",
  s1Desc: "Read calmly, close to the microphone:",
  s1Line: "I am Ahmad Khezripour",
  s2Title: "Nightmare Hum",
  s2Desc: "Make the sound you make in your nightmares:",
  s2Line: "Hum… hum…",
  tapStart: "Tap the microphone to start",
  tapStop: "Recording… tap to finish",
  analyzing: "Learning your voice tone…",
  savedTitle: "Voice tone saved",
  retryTitle: "Voice not recognized clearly",
  retryTooShort: "Too short — hold it a little longer",
  retryTooQuiet: "Too quiet — speak a bit louder",
  retryUnstable: "No steady “hum hum” was detected",
  retryPitch: "Pitch not detected — try again",
  tryAgain: "Try again",
  nextStep: "Next step",
  finish: "Finish",
  allDoneTitle: "The guardian learned your voice",
  allDoneDesc: "From now on, hearing your voice will raise the alarm",
  micFailTitle: "Microphone unavailable",
  micFailDesc: "Please allow microphone access and try again",
  backLabel: "Back",

  sheetTitle: "Alarm Sound",
  sheetDesc: "Preview and pick one",
  alarmNames: {
    dawn: "Daybreak",
    bell: "Classic Bell",
    pulse: "Urgency Pulse",
    moon: "Moonbeam",
    meteor: "Meteor",
  },
  myFile: "My file",
  browseFile: "Choose an audio file…",
  closeLabel: "Close",

  monTitle: "Guardian awake",
  monDesc: "Sleep tight — we're listening for your voice",
  calibrating: "Calibrating with room silence…",
  listening: "Listening",
  heardYou: "Your voice!",
  stopGuard: "Stop guarding",
  screenOffOk: "You may dim the screen — the guardian stays in the background",
  alarmWith: (name: string) => `Alarm: ${name}`,
  levelLabel: "Room level",

  wakeTitle: "WAKE UP!",
  wakeSub: "The guardian heard your voice",
  dismiss: "I'm awake",
  ringingNote: "The alarm won't stop until you tap",
  resumed: "Guardian resumed",

  exitTitle: "Goodnight",
  exitDesc: "Dream Guardian is completely off",
  relaunch: "Relaunch",
};

export const dictionaries: Record<Lang, Dict> = { fa, en };

function toFaDigits(n: number | string): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function digits(s: string | number, lang: Lang): string {
  return lang === "fa" ? toFaDigits(s) : String(s);
}

export const ALARM_IDS = ["dawn", "bell", "pulse", "moon", "meteor"] as const;
export type AlarmId = (typeof ALARM_IDS)[number];
