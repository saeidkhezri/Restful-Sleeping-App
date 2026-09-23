<div align="center">

![Dream Guardian Banner](https://img.shields.io/badge/حافظ_خواب_آرام_شما-Peaceful_Sleep_Guardian-5eead4?style=for-the-badge)

# 🌙 حافظ خواب آرام شما  
### Your Peaceful Sleep Guardian

[![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/dream-guardian/android-apk.yml?style=for-the-badge&logo=github)](https://github.com/yourusername/dream-guardian/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-a78bfa.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5eead4?style=for-the-badge&logo=pwa)](https://pwa.shields.io/)
[![Android](https://img.shields.io/badge/Android-10+-3DDC84?style=for-the-badge&logo=android)](https://www.android.com/)

[English](#english) · [فارسی](#persian)

</div>

---

<div id="english">

## 🌟 Introduction

**Your Peaceful Sleep Guardian** is an intelligent sleep monitoring application designed to detect nightmares and sleep paralysis by analyzing the user's voice tone. When the app hears sounds matching your voice pattern during sleep (like involuntary "hum hum" or weak shouts), it activates a powerful alarm with maximum volume and vibration to wake you up gently or urgently based on your preference.

<div align="center">

![Features Overview](https://via.placeholder.com/800x400/030409/5eead4?text=Sleep+Monitoring+%7C+Voice+Detection+%7C+Smart+Alarm)

</div>

---

## ✨ Key Features

### 🎯 Smart Voice Detection
- **Personalized Voice Fingerprinting**: Records your unique voice tone through two samples (intro sentence + nightmare hum)
- **Real-time Audio Analysis**: Uses Web Audio API for pitch detection, spectral centroid, and energy analysis
- **Adjustable Sensitivity**: 10-level sensitivity slider to fine-tune detection accuracy
- **Minimum Hum Requirements**: Configurable minimum count (1-5) and duration (300-2000ms) for hum sounds

### ⏰ Advanced Alarm System
- **5 Built-in Alarm Tones**: Daybreak, Classic Bell, Urgency Pulse, Moonbeam, Meteor (all synthesized)
- **Custom Alarm Library**: Add unlimited audio files from device storage
- **Gradual Volume Rise**: Gentle wake-up with 30/60/90 seconds fade-in option
- **Persistent Vibration**: Strong haptic feedback until manually dismissed

### 📊 Sleep Journal & Analytics
- **Hijri Solar Calendar**: Full Persian calendar integration for sleep tracking
- **Automatic Sleep Logging**: Records sleep duration from guard sessions
- **Nightmare Event Tracking**: Auto-logs nightmare events with timestamps
- **Pattern Analysis**: Identifies frequent causes, busiest weekdays, and peak months
- **ICS Export**: Export events to Google Calendar or other calendar apps

### 🎨 Beautiful UI/UX
- **Dual Theme Support**: Dark mode (default) + Light mode with proper color contrast
- **Dynamic Day/Night Backgrounds**: Automatically switches based on time of day
- **Ambient Nature Sounds**: 4 calming soundscapes (waves, crickets, rain, breeze) with volume control
- **Smooth Animations**: Subtle, sleep-friendly motion design

### 🔒 Privacy & Permissions
- **Real Permission Requests**: Microphone, notifications, storage, calendar, wake-lock
- **Local Storage Only**: All data stays on your device
- **No Cloud Sync**: Complete privacy by design

---

## 📱 Installation

### Option 1: PWA Install (Recommended)
1. Open the app in **Chrome** on your Android device
2. Tap the menu (⋮) → **"Add to Home Screen"**
3. The app installs like a native app with offline support

### Option 2: Build APK via GitHub Actions
1. Fork this repository
2. Go to **Actions** tab → Select **"Build Android APK"**
3. Click **"Run workflow"**
4. Download `app-debug.apk` from artifacts after build completes (~5 minutes)

### Option 3: Local Build
```bash
# Prerequisites: Node.js 20+, JDK 17, Android Studio
npm install
npm run build
npx cap add android
node scripts/patchAndroidManifest.mjs
npx cap sync android
npx cap open android
# Then in Android Studio: Build → Build APK
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS 4, Framer Motion |
| **Audio** | Web Audio API (custom synth + analysis) |
| **Calendar** | jalaali-js (Persian Hijri) |
| **Mobile** | Capacitor (Android native wrapper) |
| **PWA** | Service Worker, Web Manifest |

---

## 🎛️ Usage Guide

### First-Time Setup
1. **Choose Language**: Select Persian (فارسی) or English
2. **Grant Permissions**: Allow microphone, storage, notifications (real system dialogs)
3. **Record Voice**: 
   - Say "I am Ahmad Khezripour" (or Persian equivalent)
   - Make your typical nightmare "hum hum" sound
4. **Select Alarm**: Choose from built-in tones or add custom file
5. **Adjust Settings**: Set sensitivity, hum thresholds, volume rise

### Daily Use
- Open app → Tap **"Start Guarding"**
- Place phone nearby while sleeping
- App listens in background (screen can be off)
- If nightmare detected → Alarm activates
- Dismiss by tapping **"I'm awake"** button

### Sleep Journal
- Navigate to **Journal** tab
- View calendar with sleep/nightmare indicators
- Add manual events or adjust sleep duration
- Write possible causes for pattern analysis
- Export to calendar yearly stats

---

## 🌈 Themes & Accessibility

| Dark Mode | Light Mode |
|-----------|------------|
| Deep navy gradients (#010106 → #08082c) | Soft sky blues (#c8ddf2 → #fbfdff) |
| High-contrast white text | Dark gray text (#111827) |
| Subtle star animations | Gentle cloud drift |
| Reduced blue light emission | Natural daylight simulation |

Toggle theme in **Settings → Appearance**

---

## 🔊 Ambient Soundscapes

| Track | Source | License |
|-------|--------|---------|
| 🌊 Ocean Shore | Wikimedia Commons (Orion tw) | CC BY-SA 3.0 |
| 🦗 Night Crickets | OpenGameArt (Wolfgang_) | CC0 |
| 🌧️ Soft Rain | pdsounds / Wikimedia (cori) | Public Domain |
| 🍃 Lakeside Breeze | Wikimedia Commons (Dsw4) | Public Domain |

*If download fails (offline), synthesized fallback plays automatically*

---

## 📊 Sleep Analytics Example

```
One-Year Overview:
├─ Nights Logged: 127
├─ Nightmare Events: 34
├─ Avg. Sleep: 6h 42m
├─ Calm Streak: 12 nights
├─ Busiest Day: Saturdays
├─ Peak Month: Mehr (Persian)
└─ Top Causes: stress, late-meal, caffeine
```

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see below for details:

```
Copyright (c) 2025 Mohammadsaeid Khezripour

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👨‍💻 Author & Dedication

<div align="center">

**طراح و ناشر: محمدسعید خضری‌پور**  
*یادگاری کوچکی تقدیم به پدر عزیزم، آقای احمد خضری‌پور*

---

**Designed & Published by Mohammadsaeid Khezripour**  
*A small keepsake for my dear father, Mr. Ahmad Khezripour*

</div>

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/dream-guardian/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/dream-guardian/discussions)
- **Email**: your.email@example.com

---

## 🙏 Acknowledgments

- Voice detection algorithm inspired by research on sleep disorder monitoring
- Calendar implementation using jalaali-js library
- Ambient sounds from generous open-source contributors
- Built with love for better sleep health

---

<div align="center">

**Made with 💜 for peaceful nights**

[⬆ Back to Top](#-your-peaceful-sleep-guardian)

</div>

</div>

---

<div id="persian" dir="rtl">

## 🌟 معرفی

**حافظ خواب آرام شما** یک اپلیکیشن هوشمند پایش خواب است که با تحلیل تن صدای کاربر، کابوس‌ها و بختک‌ها را تشخیص می‌دهد. وقتی اپ صداهایی منطبق با الگوی صدای شما را در خواب بشنود (مثل «هوم هوم» غیرارادی یا فریادهای ضعیف)، با حداکثر بلندی و لرزش هشدار فعال می‌کند تا شما را به آرامی یا به‌صورت فوری بیدار کند.

<div align="center">

![بررسی ویژگی‌ها](https://via.placeholder.com/800x400/030409/5eead4?text=پایش+خواب+%7C+تشخیص+صدا+%7C+هشدار+هوشمند)

</div>

---

## ✨ ویژگی‌های کلیدی

### 🎯 تشخیص هوشمند صدا
- **اثرگذاری تن صدای شخصی**: ضبط تن صدای منحصر‌به‌فرد شما از طریق دو نمونه (جمله معرفی + هوم کابوس)
- **تحلیل صوتی بلادرنگ**: استفاده از Web Audio API برای تشخیص پیچ صدا، مرکز طیفی و تحلیل انرژی
- **حساسیت قابل تنظیم**: اسلایدر ۱۰ سطحی برای تنظیم دقیق دقت تشخیص
- **حداقل الزامات هوم**: قابل تنظیم حداقل تعداد (۱ تا ۵) و مدت (۳۰۰ تا ۲۰۰۰ میلی‌ثانیه) برای صداهای هوم

### ⏰ سیستم پیشرفته هشدار
- **۵ صدای هشدار داخلی**: سپیده‌دم، زنگ کلاسیک، پالس بیدارباش، ماه‌تاب، شهاب‌سنگ (همه سنتزشده)
- **آرشیو آلارم سفارشی**: افزودن فایل‌های صوتی نامحدود از حافظه دستگاه
- **افزایش تدریجی بلندی**: بیدار شدن ملایم با گزینه fade-in سه‌گانه (۳۰/۶۰/۹۰ ثانیه)
- **لرزش پیوسته**: بازخورد هپتیک قوی تا زمان رد دستی

### 📊 ژورنال خواب و تحلیل
- **تقویم هجری شمسی**: ادغام کامل تقویم فارسی برای ردیابی خواب
- **ثبت خودکار خواب**: ضبط مدت خواب از جلسات نگهبانی
- **ردیابی رویدادهای کابوس**: ثبت خودکار رویدادها با timestamp
- **تحلیل الگو**: شناسایی علت‌های پرتکرار، شلوغ‌ترین روزهای هفته و اوج ماه‌ها
- **خروجی ICS**: صادرات رویدادها به Google Calendar یا سایر اپ‌های تقویم

### 🎨 رابط کاربری زیبا
- **پشتیبانی از دو تم**: حالت دارک (پیش‌فرض) + حالت لایت با کنتراست رنگ مناسب
- **پس‌زمینه‌های پویای روز/شب**: تغییر خودکار بر اساس زمان روز
- **صداهای طبیعت آرام‌بخش**: ۴ منظره صوتی (موج، جیرجیرک، باران، نسیم) با کنترل بلندی
- **انیمیشن‌های نرم**: طراحی حرکتی ملایم و مناسب خواب

### 🔒 حریم خصوصی و دسترسی‌ها
- **درخواست‌های واقعی دسترسی**: میکروفون، اعلان، حافظه، تقویم، wake-lock
- **فقط حافظه محلی**: تمام داده‌ها روی دستگاه شما می‌مانند
- **بدون همگام‌سازی ابری**: حریم خصوصی کامل توسط طراحی

---

## 📱 نصب

### گزینه ۱: نصب PWA (پیشنهادی)
1. اپ را در **Chrome** روی دستگاه اندروید باز کنید
2. منو (⋮) را بزنید → **"Add to Home Screen"**
3. اپ مانند اپ بومی با پشتیبانی آفلاین نصب می‌شود

### گزینه ۲: ساخت APK از طریق GitHub Actions
1. این ریپازیتوری را Fork کنید
2. به تب **Actions** بروید → **"Build Android APK"** را انتخاب کنید
3. **"Run workflow"** را بزنید
4. پس از تکمیل بیلد (~۵ دقیقه) فایل `app-debug.apk` را از artifacts دانلود کنید

### گزینه ۳: بیلد محلی
```bash
# پیش‌نیازها: Node.js 20+, JDK 17, Android Studio
npm install
npm run build
npx cap add android
node scripts/patchAndroidManifest.mjs
npx cap sync android
npx cap open android
# سپس در Android Studio: Build → Build APK
```

---

## 🛠️ پشته تکنولوژی

| دسته‌بندی | تکنولوژی |
|-----------|----------|
| **فرانت‌اند** | React 19, TypeScript, Vite |
| **استایل** | Tailwind CSS 4, Framer Motion |
| **صدا** | Web Audio API (سنتز + تحلیل سفارشی) |
| **تقویم** | jalaali-js (هجری شمسی) |
| **موبایل** | Capacitor (رپر بومی اندروید) |
| **PWA** | Service Worker, Web Manifest |

---

## 🎛️ راهنمای استفاده

### راه‌اندازی اولیه
1. **انتخاب زبان**: فارسی یا انگلیسی را انتخاب کنید
2. **اعطای دسترسی‌ها**: اجازه میکروفون، حافظه، اعلان‌ها (دیالوگ‌های واقعی سیستم)
3. **ضبط صدا**: 
   - بگویید «من احمد خضری پور هستم»
   - صدای هوم هوم معمول کابوس خود را تولید کنید
4. **انتخاب هشدار**: از تن‌های داخلی انتخاب کنید یا فایل سفارشی اضافه کنید
5. **تنظیمات**: حساسیت، آستانه‌های هوم، افزایش بلندی را تنظیم کنید

### استفاده روزانه
- اپ را باز کنید → **«شروع نگهبانی»** را بزنید
- گوشی را نزدیک خود در خواب قرار دهید
- اپ در پس‌زمینه گوش می‌دهد (صفحه می‌تواند خاموش باشد)
- اگر کابوس تشخیص داده شد → هشدار فعال می‌شود
- با زدن دکمه **«بیدار شدم»** رد کنید

### ژورنال خواب
- به تب **تقویم و سوابق** بروید
- تقویم را با نشانگرهای خواب/کابوس ببینید
- رویدادهای دستی اضافه کنید یا مدت خواب را تنظیم کنید
- علت‌های احتمالی برای تحلیل الگو بنویسید
- آمار سالانه را به تقویم صادرات کنید

---

## 🌈 تم‌ها و دسترسی‌پذیری

| حالت دارک | حالت لایت |
|-----------|------------|
| گرادینت‌های سرمه‌ای عمیق (#010106 → #08082c) | آبی‌های آسمانی نرم (#c8ddf2 → #fbfdff) |
| متن سفید با کنتراست بالا | متن خاکستری تیره (#111827) |
| انیمیشن‌های ظریف ستاره | drift ابرهای ملایم |
| کاهش انتشار نور آبی | شبیه‌سازی نور طبیعی روز |

تغییر تم در **تنظیمات → ظاهر**

---

## 🔊 مناظر صوتی طبیعت

| ترک | منبع | لایسنس |
|-------|--------|---------|
| 🌊 موج ساحل | Wikimedia Commons (Orion tw) | CC BY-SA 3.0 |
| 🦗 جیرجیرک شب | OpenGameArt (Wolfgang_) | CC0 |
| 🌧️ باران نم‌نم | pdsounds / Wikimedia (cori) | Public Domain |
| 🍃 نسیم دریاچه | Wikimedia Commons (Dsw4) | Public Domain |

*اگر دانلود ناموفق باشد (آفلاین)، نسخه سنتزشده به‌صورت خودکار پخش می‌شود*

---

## 📊 نمونه تحلیل خواب

```
نگاه یک‌ساله:
├─ شب‌های ثبت‌شده: ۱۲۷
├─ رویدادهای کابوس: ۳۴
├─ میانگین خواب: ۶ ساعت و ۴۲ دقیقه
├─ شب‌های آرام پیاپی: ۱۲ شب
├─ شلوغ‌ترین روز: شنبه‌ها
├─ ماه اوج: مهر
└─ علت‌های برتر: استرس، غذای دیرهنگام، کافئین
```

---

## 🤝 مشارکت

از مشارکت شما استقبال می‌شود! لطفاً:
1. ریپازیتوری را Fork کنید
2. برنچ ویژگی بسازید (`git checkout -b feature/amazing-feature`)
3. تغییرات را کامیت کنید (`git commit -m 'Add amazing feature'`)
4. به برنچ پوش کنید (`git push origin feature/amazing-feature`)
5. Pull Request باز کنید

---

## 📄 لایسنس

این پروژه تحت **لایسنس MIT** است - برای جزئیات بیشتر ببینید:

```
Copyright (c) 2025 محمدسعید خضری‌پور

این مجوز به هر کسی که یک کپی از این نرم‌افزار و فایل‌های مستندات همراه آن را دریافت می‌کند، اجازه می‌دهد
بدون محدودیت در نرم‌افزار معامله کند، از جمله بدون محدودیت حقوق استفاده، کپی‌برداری، تغییر، ادغام،
انتشار، توزیع، زیرمجموعه‌سازی، و/یا فروش کپی‌های نرم‌افزار را بدهد.
```

---

## 👨‍💻 نویسنده و تقدیم

<div align="center">

**طراح و ناشر: محمدسعید خضری‌پور**  
*یادگاری کوچکی تقدیم به پدر عزیزم، آقای احمد خضری‌پور*

---

**Designed & Published by Mohammadsaeid Khezripour**  
*A small keepsake for my dear father, Mr. Ahmad Khezripour*

</div>

---

## 📞 پشتیبانی و تماس

- **مشکلات**: [GitHub Issues](https://github.com/yourusername/dream-guardian/issues)
- **بحث‌ها**: [GitHub Discussions](https://github.com/yourusername/dream-guardian/discussions)
- **ایمیل**: your.email@example.com

---

## 🙏 سپاسگزاری

- الگوریتم تشخیص صدا الهام‌گرفته از تحقیقات پایش اختلالات خواب
- پیاده‌سازی تقویم با استفاده از کتابخانه jalaali-js
- صداهای طبیعت از مشارکت‌کنندگان سخاوتمند متن‌باز
- ساخته شده با عشق برای سلامت خواب بهتر

---

<div align="center">

**ساخته شده با 💜 برای شب‌های آرام**

[⬆ بازگشت به بالا](#-حافظ-خواب-آرام-شما)

</div>

</div>

---

<div align="center">

### 📱 Quick Links

[Download APK](https://github.com/yourusername/dream-guardian/releases) • [Report Bug](https://github.com/yourusername/dream-guardian/issues) • [Request Feature](https://github.com/yourusername/dream-guardian/discussions) • [Documentation](./ANDROID_BUILD_GUIDE.md)

</div>
