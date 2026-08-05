export const R2_BASE_URL = process.env.NEXT_PUBLIC_R2_URL || '';
export const R2_WINDOWS_EXE = R2_BASE_URL ? `${R2_BASE_URL}/Discipline-Tracker-Setup.exe` : '';
export const R2_ANDROID_APK = R2_BASE_URL ? `${R2_BASE_URL}/discipline-tracker.apk` : '';

export const ANDROID_APK_PATH = '/downloads/discipline-tracker.apk';
export const ANDROID_APK_URL = R2_ANDROID_APK || ANDROID_APK_PATH;
export const WINDOWS_EXE_URL = R2_WINDOWS_EXE || '/downloads/Discipline-Tracker-Setup.exe';
