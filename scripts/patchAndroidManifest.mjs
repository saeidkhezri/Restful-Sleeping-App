// Injects the Android permissions Dream Guardian needs into AndroidManifest.xml
// Run AFTER `npx cap add android` (platform generated), BEFORE `./gradlew assembleDebug`
import fs from "node:fs";

const manifestPath = "android/app/src/main/AndroidManifest.xml";

if (!fs.existsSync(manifestPath)) {
  console.log("⚠ AndroidManifest.xml not found — run `npx cap add android` first.");
  process.exit(0);
}

const permissions = [
  "android.permission.RECORD_AUDIO",
  "android.permission.MODIFY_AUDIO_SETTINGS",
  "android.permission.VIBRATE",
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.WAKE_LOCK",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_MICROPHONE",
];

let xml = fs.readFileSync(manifestPath, "utf8");

if (xml.includes("RECORD_AUDIO")) {
  console.log("✓ Permissions already present — nothing to do.");
  process.exit(0);
}

const block = permissions.map((p) => `    <uses-permission android:name="${p}" />`).join("\n");

xml = xml.replace(/<application/g, `${block}\n\n    <application`);

fs.writeFileSync(manifestPath, xml);
console.log("✓ Android permissions injected:", permissions.join(", "));
