export interface SubscriptionData {
  isSubscribed: boolean;
  packageType: '3months' | '6months' | '1year' | 'lifetime' | '3days' | null;
  expiryDate: string | null; // ISO string
  activatedCode: string | null;
  deviceId: string;
}

export interface ActivationCode {
  code: string;
  packageType: '3months' | '6months' | '1year' | 'lifetime';
  durationMonths: number; // 3, 6, 12, or 999 (lifetime)
  status: 'unused' | 'used';
  usedByDeviceId?: string;
  createdAt: string;
}

const STORAGE_KEY_SUB = 'jyotish_subscription_v1';
const STORAGE_KEY_CODES = 'jyotish_admin_codes_v1';
const STORAGE_KEY_DEVICE = 'jyotish_device_id_v1';

export function getDeviceId(): string {
  let devId = localStorage.getItem(STORAGE_KEY_DEVICE);
  if (!devId) {
    devId = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(STORAGE_KEY_DEVICE, devId);
  }
  return devId;
}

export function hasTrialBeenUsed(): boolean {
  const devId = getDeviceId();
  return localStorage.getItem(`jyotish_trial_used_${devId}`) === 'true';
}

export function startFreeTrial(): { success: boolean; message: string } {
  const devId = getDeviceId();
  if (hasTrialBeenUsed()) {
    return { success: false, message: 'यो डिभाइसमा ३ दिनको फ्री ट्रायल पहिल्यै प्रयोग भइसकेको छ। अब सदस्यता लिनुहोस्।' };
  }

  const now = new Date();
  const expiry = new Date();
  expiry.setDate(now.getDate() + 3); // 3 days free trial

  const subData: SubscriptionData = {
    isSubscribed: true,
    packageType: '3days',
    expiryDate: expiry.toISOString(),
    activatedCode: 'FREE-TRIAL-3DAYS',
    deviceId: devId,
  };

  localStorage.setItem(STORAGE_KEY_SUB, JSON.stringify(subData));
  localStorage.setItem(`jyotish_trial_used_${devId}`, 'true');

  return { success: true, message: 'बधाई छ! तपाईंको ३ दिनको फ्री ट्रायल सफलतापूर्वक सक्रिय भयो।' };
}

export function getSubscription(): SubscriptionData {
  const devId = getDeviceId();
  const raw = localStorage.getItem(STORAGE_KEY_SUB);
  if (!raw) {
    return {
      isSubscribed: false,
      packageType: null,
      expiryDate: null,
      activatedCode: null,
      deviceId: devId,
    };
  }
  try {
    const data: SubscriptionData = JSON.parse(raw);
    // Check expiry
    if (data.isSubscribed && data.expiryDate) {
      const exp = new Date(data.expiryDate).getTime();
      if (Date.now() > exp && data.packageType !== 'lifetime') {
        return {
          ...data,
          isSubscribed: false,
        };
      }
    }
    return data;
  } catch (e) {
    return {
      isSubscribed: false,
      packageType: null,
      expiryDate: null,
      activatedCode: null,
      deviceId: devId,
    };
  }
}

export function getAdminCodes(): ActivationCode[] {
  const raw = localStorage.getItem(STORAGE_KEY_CODES);
  if (!raw) {
    // Default initial sample codes for testing
    const defaults: ActivationCode[] = [
      {
        code: 'JYOTISH-3M-7788',
        packageType: '3months',
        durationMonths: 3,
        status: 'unused',
        createdAt: new Date().toISOString(),
      },
      {
        code: 'JYOTISH-1Y-9911',
        packageType: '1year',
        durationMonths: 12,
        status: 'unused',
        createdAt: new Date().toISOString(),
      },
      {
        code: 'JYOTISH-LIFE-5555',
        packageType: 'lifetime',
        durationMonths: 999,
        status: 'unused',
        createdAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEY_CODES, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveAdminCodes(codes: ActivationCode[]): void {
  localStorage.setItem(STORAGE_KEY_CODES, JSON.stringify(codes));
}

export function generateActivationCode(packageType: '3months' | '6months' | '1year' | 'lifetime'): ActivationCode {
  const codes = getAdminCodes();
  const prefix = packageType === '3months' ? '3M' : packageType === '6months' ? '6M' : packageType === '1year' ? '1Y' : 'LIFE';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newCodeStr = `JYOTISH-${prefix}-${randomNum}`;
  
  const durationMonths = packageType === '3months' ? 3 : packageType === '6months' ? 6 : packageType === '1year' ? 12 : 999;
  
  const newEntry: ActivationCode = {
    code: newCodeStr,
    packageType,
    durationMonths,
    status: 'unused',
    createdAt: new Date().toISOString(),
  };

  codes.unshift(newEntry);
  saveAdminCodes(codes);
  return newEntry;
}

export function createManualActivationCode(customCode: string, packageType: '3months' | '6months' | '1year' | 'lifetime'): { success: boolean; message: string; code?: ActivationCode } {
  const codes = getAdminCodes();
  const trimmed = customCode.trim().toUpperCase();
  if (!trimmed) {
    return { success: false, message: 'कृपया कोड लेख्नुहोस्।' };
  }
  if (codes.some(c => c.code.toUpperCase() === trimmed)) {
    return { success: false, message: 'यो कोड पहिल्यै बनिसकेको छ। अर्को नाम दिनुहोस्।' };
  }

  const durationMonths = packageType === '3months' ? 3 : packageType === '6months' ? 6 : packageType === '1year' ? 12 : 999;

  const newEntry: ActivationCode = {
    code: trimmed,
    packageType,
    durationMonths,
    status: 'unused',
    createdAt: new Date().toISOString(),
  };

  codes.unshift(newEntry);
  saveAdminCodes(codes);
  return { success: true, message: `सफलतापूर्वक नयाँ म्यानुअल कोड बन्यो: ${trimmed}`, code: newEntry };
}

export function redeemCode(inputCode: string): { success: boolean; message: string } {
  const codes = getAdminCodes();
  const trimmed = inputCode.trim().toUpperCase();
  const found = codes.find(c => c.code.toUpperCase() === trimmed);

  if (!found) {
    return { success: false, message: 'अमान्य कोड! यो कोड एडमिन प्यानलमा खुला छैन। कृपया +977-9863991384 मा कल वा व्हाट्सएप मार्फत सम्पर्क गरेर कोड प्राप्त गर्नुहोस्।' };
  }

  const devId = getDeviceId();

  if (found.status === 'used') {
    if (found.usedByDeviceId === devId) {
      // Already used by this device, ensure subscription is active
      return { success: true, message: 'तपाईंको यो कोड पहिले नै सक्रिय छ!' };
    }
    return { success: false, message: 'यो कोड पहिले नै अर्को डिभाइस (Device) मा प्रयोग भइसकेको छ र लक गरिएको छ।' };
  }

  // Mark code as used
  found.status = 'used';
  found.usedByDeviceId = devId;
  saveAdminCodes(codes);

  // Calculate expiry
  const now = new Date();
  let expiry = new Date();
  if (found.packageType === '3months') {
    expiry.setMonth(now.getMonth() + 3);
  } else if (found.packageType === '6months') {
    expiry.setMonth(now.getMonth() + 6);
  } else if (found.packageType === '1year') {
    expiry.setFullYear(now.getFullYear() + 1);
  } else {
    // lifetime
    expiry.setFullYear(now.getFullYear() + 100);
  }

  const subData: SubscriptionData = {
    isSubscribed: true,
    packageType: found.packageType,
    expiryDate: expiry.toISOString(),
    activatedCode: found.code,
    deviceId: devId,
  };

  localStorage.setItem(STORAGE_KEY_SUB, JSON.stringify(subData));
  return { success: true, message: 'बधाई छ! तपाईंको परम्परागत नेपाली पत्रिका सदस्यता सफलतापूर्वक सक्रिय भयो।' };
}
