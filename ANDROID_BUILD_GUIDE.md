# 📱 راهنمای ساخت فایل APK نگهبان خواب (Dream Guardian)

این پروژه به‌صورت کامل برای تولید APK آماده شده است (Capacitor + دسترسی‌های اندروید + ورک‌فلوی ابری).
راستش: کامپایل باینری APK به Android SDK نیاز دارد که تنها روی یک کامپیوتر یا سرور ابری اجرا می‌شود؛
به‌همین دلیل سه راه آماده کرده‌ایم — یکی را انتخاب کنید:

---

## روش ۱ — بدون کامپیوتر: ساخت APK با GitHub Actions (پیشنهادی، رایگان) ☁️

پروژه هم‌اکنون ورک‌فلوی آماده دارد (`.github/workflows/android-apk.yml`):

1. این پروژه را در یک ریپوی GitHub آپلود کنید (روی branch `main`).
2. در GitHub وارد تب **Actions** شوید.
3. ورک‌فلوی **Build Android APK** را انتخاب و دکمه **Run workflow** را بزنید.
4. بعد از چند دقیقه (معمولاً ۵ تا ۸ دقیقه)، روی اجرای تمام‌شده کلیک کنید و از بخش **Artifacts** فایل
   **`dream-guardian-apk`** را دانلود کنید — داخلش `app-debug.apk` آماده نصب است.
5. فایل را به گوشی منتقل کنید، نصب از منابع ناشناس را اجازه دهید و نصب کنید.

> نسخه debug برای استفاده شخصی کاملاً کافی است (امضای آزمایشی خودکار).
> برای انتشار در گوگل‌پلی، نسخه release با keystore شخصی امضا می‌شود.

---

## روش ۲ — بدون ابزار: PWABuilder (از روی نسخه تحت وب) 🌐

اگر نسخه وب اپ را روی یک هاست HTTPS (مثل Netlify یا Vercel) قرار دهید:

1. به سایت **pwabuilder.com** بروید و آدرس اپ را وارد کنید.
2. گزینه **Package for Android** → **Download** را بزنید.
3. خروجی (APK/AAB) را دانلود و روی گوشی نصب کنید.

اپ ما از قبل PWA کامل است: `manifest.webmanifest` + آیکون‌ها + سرویس‌ورکر آفلاین ✅

---

## روش ۳ — ساخت محلی با Android Studio 💻

پیش‌نیاز: Node.js 20، JDK 17 و Android Studio.

```bash
npm install
npm run build
npx cap add android            # ساخت پروژه اندروید (یک‌بار)
node scripts/patchAndroidManifest.mjs   # تزریق دسترسی‌های میکروفون/لرزش/اعلان
npx cap sync android
npx cap open android           # باز شدن در Android Studio
```

سپس در Android Studio:
- برای تست روی گوشی: **Run ▶**
- برای گرفتن فایل: **Build → Build App Bundle(s) / APK(s) → Build APK(s)**
- خروجی: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🍬 نصب فوری بدون APK: نسخه PWA

نسخه وب اپ، یک **PWA کامل** است؛ کافی است روی گوشی اندرویدتان:

1. اپ را در **Chrome** باز کنید (نیاز به HTTPS یا localhost).
2. منوی ⋮ → **Add to Home screen / نصب برنامه** را بزنید.
3. اپ مانند یک برنامه بومی، تمام‌صفحه و آفلاین روی گوشی نصب می‌شود و
   دسترسی‌های میکروفون و لرزش دقیقاً مانند نسخه APK کار می‌کنند.

---

## ⚙️ نکات فنی نسخه اندروید

- دسترسی‌های تزریق‌شده در `AndroidManifest.xml` (به‌صورت خودکار با اسکریپت `scripts/patchAndroidManifest.mjs`):
  `RECORD_AUDIO` (شنیدن تن صدا)، `MODIFY_AUDIO_SETTINGS`، `VIBRATE` (لرزش هشدار)،
  `POST_NOTIFICATIONS`، `WAKE_LOCK` و `FOREGROUND_SERVICE_MICROPHONE` (نگهبانی در پس‌زمینه).
- برای اطمینان از نگهبانی شبانه، در تنظیمات گوشی **بهینه‌سازی باتری** را برای اپ خاموش کنید
  (تنظیمات ← باتری ← مصرف باتری برنامه‌ها ← نگهبان خواب ← بدون محدودیت).
- بلندی صدای مدیا (Media Volume) گوشی را در حالت نگهبانی زیاد کنید تا هشدار با حداکثر قدرت پخش شود.
