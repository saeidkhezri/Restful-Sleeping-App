# 🎨 آیکون‌ها و لوگوی حافظ خواب آرام شما
# Dream Guardian Icons & Logo Guide

## 📁 فایل‌های موجود / Available Files

### آیکون‌های اپلیکیشن / App Icons

| فایل / File | سایز / Size | کاربرد / Usage |
|-------------|-------------|----------------|
| `icon-192.png` | 192×192 | PWA, Android, Favicon |
| `icon-512.png` | 512×512 | PWA, Android, Store |
| `icon-maskable-512.png` | 512×512 | Android Adaptive Icon |
| `logo.svg` | 512×512 | Vector logo, Scalable |

### لوگوها / Logos

| فایل / File | نوع / Type | کاربرد / Usage |
|-------------|-----------|----------------|
| `logo.svg` | وکتور / Vector | استفاده در اپ، وب‌سایت / App, Website |
| `logo-simple.svg` | وکتور ساده / Simple Vector | زمینه‌های رنگی / Colored backgrounds |
| `logo-horizontal.png` | PNG افقی / Horizontal PNG | هدر، بنر / Header, Banner |
| `logo-icon-only.png` | PNG آیکون / Icon PNG | پروفایل، آواتار / Profile, Avatar |

---

## 🎨 طراحی / Design Concept

### المان‌ها / Elements

1. **هلال ماه / Crescent Moon**
   - رنگ طلایی گرم (#fcd9a0)
   - نماد خواب و شب
   - Symbol of sleep and night

2. **امواج صدا / Sound Waves**
   - سه قوس فیروزه‌ای (#5eead4)
   - نشان‌دهنده تشخیص تن صدا
   - Represents voice tone detection

3. **پس‌زمینه / Background**
   - گرادینت سرمه‌ای عمیق (#0a0a1a → #1a1a3a)
   - القای آرامش و شب
   - Evokes calmness and night

4. **ستاره‌ها / Stars**
   - نقاط سفید ریز با انیمیشن چشمک‌زن
   - جزئیات ظریف و مدرن
   - Subtle modern details

---

## 🚀 نحوه استفاده / Usage

### در کد React / In React Code

```tsx
import Logo from "./components/Logo";

// آیکون ساده / Simple icon
<Logo size="md" theme="dark" />

// با متن / With text
<Logo size="lg" withText theme="dark" />

// سایزهای مختلف / Different sizes
<Logo size="sm" />  // 32px
<Logo size="md" />  // 48px
<Logo size="lg" />  // 64px
<Logo size="xl" />  // 96px
```

### در HTML / In HTML

```html
<!-- Favicon -->
<link rel="icon" href="/icons/logo.svg" type="image/svg+xml">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="/icons/icon-192.png">

<!-- PWA Manifest -->
{
  "icons": [
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### در اندروید / In Android

```xml
<!-- res/mipmap-anydpi-v26/ic_launcher.xml -->
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/icon_background"/>
    <foreground android:drawable="@mipmap/icon-maskable-512"/>
</adaptive-icon>
```

---

## 🎯 بهترین روش‌ها / Best Practices

### ✅ انجام دهید / Do

- از SVG برای وب استفاده کنید (بهترین کیفیت)
- از آیکون maskable برای اندروید استفاده کنید
- تم رنگی لوگو را با تم اپ هماهنگ کنید
- فضای خالی اطراف آیکون را حفظ کنید

### ❌ انجام ندهید / Don't

- آیکون را کش ندهید (نسبت ابعاد را حفظ کنید)
- رنگ‌ها را تغییر ندهید (هویت بصری حفظ شود)
- آیکون را روی زمینه‌های شلوغ قرار ندهید
- از افکت‌های اضافی روی لوگو استفاده نکنید

---

## 📐 مشخصات فنی / Technical Specs

### رنگ‌ها / Colors

| نام / Name | HEX | RGB | کاربرد / Usage |
|------------|-----|-----|----------------|
| Navy Dark | `#0a0a1a` | 10,10,26 | پس‌زمینه / Background |
| Navy Light | `#1a1a3a` | 26,26,58 | گرادینت / Gradient |
| Moon Gold | `#fcd9a0` | 252,217,160 | ماه / Moon |
| Teal Wave | `#5eead4` | 94,234,212 | امواج / Waves |
| White | `#ffffff` | 255,255,255 | ستاره‌ها / Stars |

### تایپوگرافی / Typography

- **فارسی**: Vazirmatn (ExtraBold for title)
- **انگلیسی**: Outfit (Medium for subtitle)

### فاصله‌ها / Spacing

- حاشیه امن آیکون: 20% از هر طرف
- حداقل فضای خالی اطراف لوگو: 16px
- نسبت ابعاد: 1:1 (مربع)

---

## 📱 پلتفرم‌ها / Platforms

### PWA
```json
{
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192" },
    { "src": "/icons/icon-512.png", "sizes": "512x512" },
    { "src": "/icons/icon-maskable-512.png", "purpose": "maskable" }
  ]
}
```

### Android
- Adaptive Icon: `icon-maskable-512.png`
- Legacy Icon: `icon-192.png`
- Play Store: `icon-512.png` (high-res)

### iOS
- App Icon: `icon-192.png` (scaled)
- Splash: Use `logo-horizontal.png`

### Web
- Favicon: `logo.svg`
- OG Image: `logo-horizontal.png`

---

## 🔄 به‌روزرسانی / Updates

برای به‌روزرسانی آیکون‌ها:
1. فایل‌های جدید را در `/public/icons/` قرار دهید
2. نام‌ها را یکسان نگه دارید
3. کش مرورگر را پاک کنید
4. در اندروید: `npx cap sync android`

To update icons:
1. Place new files in `/public/icons/`
2. Keep filenames consistent
3. Clear browser cache
4. On Android: `npx cap sync android`

---

## 📞 پشتیبانی / Support

برای سوالات یا درخواست‌های طراحی:
- GitHub Issues
- Email: your.email@example.com

For design questions or requests:
- GitHub Issues
- Email: your.email@example.com

---

<div align="center">

**طراحی شده با 💜 برای خواب آرام**

*Designed with 💜 for peaceful sleep*

</div>
