import type { SupportedLanguage } from '../types';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
];

export interface TranslationStrings {
  // Login & Global
  govIndia: string;
  ministry: string;
  officialGateway: string;
  platformTitle: string;
  descriptor: string;
  nicAuth: string;
  nationalPortal: string;
  authority: string;
  gatewayTitle: string;
  secureAccess: string;
  selectCategory: string;
  govLogin: string;
  citizenLogin: string;
  govSupporting: string;
  citizenSupporting: string;
  enterCredentials: string;
  userIdLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  govPlaceholder: string;
  citizenPlaceholder: string;
  loginButton: string;
  fieldRequiredError: string;
  loginSuccessGov: (id: string) => string;
  loginSuccessCitizen: (id: string) => string;
  govNoticeTitle: string;
  govNotice: string;
  citizenNoticeTitle: string;
  citizenNotice: string;
  portalVersion: string;
  sslEncrypted: string;
  serverTime: string;
  websitePolicies: string;
  termsOfUse: string;
  privacy: string;
  helpdesk: string;
  copyright: string;
  selectLanguage: string;

  // Citizen Portal Navigation & Global
  citizenPortalTitle: string;
  citizenBadge: string;
  logoutBtn: string;
  tabOverview: string;
  tabReport: string;
  tabMap: string;
  tabMyReports: string;
  tabAlerts: string;

  // 1. Environmental Overview
  overviewHeading: string;
  overviewSubtitle: string;
  currentStatusLabel: string;
  currentStatusValue: string;
  aqiLabel: string;
  aqiCategory: string;
  pm25Label: string;
  pm10Label: string;
  tempLabel: string;
  tempSub: string;
  windLabel: string;
  windSub: string;
  humidityLabel: string;
  activeAdvisoryHeading: string;
  overviewMockNote: string;

  // 2. Report Issue
  reportHeading: string;
  reportSubtitle: string;
  issueCategoryLabel: string;
  catPollution: string;
  catPollutionSub: string;
  catSmoke: string;
  catSmokeSub: string;
  catFire: string;
  catFireSub: string;
  catDust: string;
  catDustSub: string;
  catFlood: string;
  catFloodSub: string;
  catHaze: string;
  catHazeSub: string;
  catWeather: string;
  catWeatherSub: string;
  photoUploadLabel: string;
  photoUploadHint: string;
  locationSelectLabel: string;
  locationPlaceholder: string;
  shortDescriptionLabel: string;
  shortDescriptionPlaceholder: string;
  submitReportBtn: string;
  reportSuccessMsg: string;
  viewInMyReportsBtn: string;

  // 3. Environmental Map
  mapHeading: string;
  mapSubtitle: string;
  mapFilterAll: string;
  mapFilterStations: string;
  mapFilterIncidents: string;
  mapFilterHotspots: string;
  mapFilterFires: string;
  mapFilterReports: string;
  mapLegendTitle: string;
  clickToInspectHint: string;

  // 4. My Reports & Tracking
  myReportsHeading: string;
  myReportsSubtitle: string;
  noReportsMsg: string;
  reportIdLabel: string;
  statusFlowTitle: string;
  statusSubmitted: string;
  statusUnderVerification: string;
  statusVerified: string;
  statusInvestigating: string;
  statusResponseInitiated: string;
  statusResolved: string;
  viewDetailsBtn: string;
  closeBtn: string;

  // 5. Alerts & Notifications
  alertsHeading: string;
  alertsSubtitle: string;
  allAlertsTab: string;
  severityCritical: string;
  severityWarning: string;
  severityAdvisory: string;
  guidelinesLabel: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    govIndia: 'Government of India',
    ministry: 'Ministry of Environment, Forest & Climate Change',
    officialGateway: 'Official Gateway',
    platformTitle: 'SAAMEK',
    descriptor: 'Environmental Monitoring & Response Platform',
    nicAuth: 'NIC Authenticated',
    nationalPortal: 'National Environmental Portal',
    authority: 'Central Pollution & Ecological Authority',
    gatewayTitle: 'Single Sign-On Authentication Gateway',
    secureAccess: 'Secure Access',
    selectCategory: 'Select Login Category',
    govLogin: 'Government / Official Login',
    citizenLogin: 'Citizen / User Login',
    govSupporting: 'For authorized government officials',
    citizenSupporting: 'For citizens and public users',
    enterCredentials: 'Enter Credentials',
    userIdLabel: 'Email / User ID',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    govPlaceholder: 'officer.env@nic.in or Official ID',
    citizenPlaceholder: 'citizen.user@saamek.in or Citizen ID',
    loginButton: 'Login',
    fieldRequiredError: 'Please enter your Email / User ID and Password.',
    loginSuccessGov: (id: string) => `Login request registered for Government Official (${id}). Frontend preview mode active.`,
    loginSuccessCitizen: (id: string) => `Login request registered for Citizen / Public User (${id}). Frontend preview mode active.`,
    govNoticeTitle: 'Official Notice:',
    govNotice: 'Access restricted to authorized environmental personnel under the IT Act.',
    citizenNoticeTitle: 'Citizen Notice:',
    citizenNotice: 'Public users can access environmental alerts and submit local observations.',
    portalVersion: 'Portal v1.0',
    sslEncrypted: '256-Bit SSL',
    serverTime: 'Server Time (IST): Active',
    websitePolicies: 'Website Policies',
    termsOfUse: 'Terms of Use',
    privacy: 'Privacy',
    helpdesk: 'Helpdesk',
    copyright: '© 2026 SAAMEK Portal. All Rights Reserved.',
    selectLanguage: 'Language',

    // Citizen Portal
    citizenPortalTitle: 'SAAMEK — Citizen Environmental Portal',
    citizenBadge: 'Citizen Public Access',
    logoutBtn: 'Logout',
    tabOverview: 'Environmental Overview',
    tabReport: 'Report Environmental Issue',
    tabMap: 'Environmental Map',
    tabMyReports: 'My Reports & Tracking',
    tabAlerts: 'Alerts & Notifications',

    // Overview
    overviewHeading: 'Citizen Environmental Overview',
    overviewSubtitle: 'Current ambient air quality, meteorological readings, and active environmental condition.',
    currentStatusLabel: 'Current Environmental Status',
    currentStatusValue: 'Moderate Air Quality • Satisfactory Ecology',
    aqiLabel: 'Air Quality Index (AQI)',
    aqiCategory: 'Moderate',
    pm25Label: 'PM2.5 Level',
    pm10Label: 'PM10 Level',
    tempLabel: 'Ambient Temperature',
    tempSub: 'Day Max: 32°C • Min: 21°C',
    windLabel: 'Wind & Atmospheric',
    windSub: 'Direction: NW • Gusts: 14 km/h',
    humidityLabel: 'Relative Humidity',
    activeAdvisoryHeading: 'Active Environmental Condition & Advisory',
    overviewMockNote: 'Displaying regional observational data for public environmental awareness.',

    // Report
    reportHeading: 'Report Environmental Issue',
    reportSubtitle: 'Submit ground-level observations for correlation with satellite data, weather dynamics, and environmental air quality sensors.',
    issueCategoryLabel: 'Select Issue Category',
    catPollution: 'Air Pollution / Poor Air Quality',
    catPollutionSub: 'Poor air quality, heavy pollution or visible air pollution',
    catSmoke: 'Smoke / Industrial Emission',
    catSmokeSub: 'Visible smoke, factory emissions or industrial burning',
    catFire: 'Forest Fire / Vegetation Fire',
    catFireSub: 'Active fire, burning vegetation or post-fire damage',
    catDust: 'Dust Storm / Sandstorm',
    catDustSub: 'Dust storms, sandstorms or dust haze events',
    catFlood: 'Flood / Waterlogging',
    catFloodSub: 'Flooding, waterlogging or stagnant water accumulation',
    catHaze: 'Haze / Smog Event',
    catHazeSub: 'Thick haze, urban smog or low-visibility conditions',
    catWeather: 'Unusual Weather Event',
    catWeatherSub: 'Unexplained weather patterns or sudden atmospheric changes',
    photoUploadLabel: 'Photo Upload (Evidence)',
    photoUploadHint: 'Attach a photo of the observed environmental issue (PNG/JPG)',
    locationSelectLabel: 'Location / Landmark',
    locationPlaceholder: 'e.g., Sector 14 Industrial Area, Near Ring Road Bypass',
    shortDescriptionLabel: 'Short Description',
    shortDescriptionPlaceholder: 'Provide specific details regarding the visible emission, open burning, or waste dumping...',
    submitReportBtn: 'Submit Report',
    reportSuccessMsg: 'Your ground-level observation has been registered successfully.',
    viewInMyReportsBtn: 'View in My Reports',

    // Map
    mapHeading: 'Environmental Map',
    mapSubtitle: 'Interactive geographical display of monitoring stations, reported incidents, fire detections, and hotspots.',
    mapFilterAll: 'All Indicators',
    mapFilterStations: 'AQ Stations',
    mapFilterIncidents: 'Active Incidents',
    mapFilterHotspots: 'Hotspots',
    mapFilterFires: 'Fire Detections',
    mapFilterReports: 'Citizen Reports',
    mapLegendTitle: 'Map Legend & Layers',
    clickToInspectHint: 'Select any marker on the map to view detailed observational parameters.',

    // My Reports
    myReportsHeading: 'My Reports & Tracking',
    myReportsSubtitle: 'Monitor the 6-stage verification and remediation lifecycle of your submitted grievances.',
    noReportsMsg: 'No reports submitted yet. Use "Report Environmental Issue" to file a report.',
    reportIdLabel: 'Report ID',
    statusFlowTitle: 'Verification & Response Stages',
    statusSubmitted: 'Submitted',
    statusUnderVerification: 'Under Verification',
    statusVerified: 'Verified',
    statusInvestigating: 'Investigating',
    statusResponseInitiated: 'Response Initiated',
    statusResolved: 'Resolved',
    viewDetailsBtn: 'Track Status',
    closeBtn: 'Close',

    // Alerts
    alertsHeading: 'Alerts & Notifications',
    alertsSubtitle: 'Official government environmental warnings, particulate advisories, and active fire notifications.',
    allAlertsTab: 'All Alerts',
    severityCritical: 'Critical',
    severityWarning: 'Warning',
    severityAdvisory: 'Advisory',
    guidelinesLabel: 'Citizen Advisory Guidelines:',
  },
  hi: {
    govIndia: 'भारत सरकार',
    ministry: 'पर्यावरण, वन एवं जलवायु परिवर्तन मंत्रालय',
    officialGateway: 'आधिकारिक प्रवेशद्वार',
    platformTitle: 'SAAMEK',
    descriptor: 'पर्यावरण निगरानी एवं प्रतिक्रिया मंच',
    nicAuth: 'एनआईसी प्रमाणित',
    nationalPortal: 'राष्ट्रीय पर्यावरण पोर्टल',
    authority: 'केंद्रीय प्रदूषण एवं पारिस्थितिक प्राधिकरण',
    gatewayTitle: 'सिंगल साइन-ऑन प्रमाणीकरण प्रवेशद्वार',
    secureAccess: 'सुरक्षित पहुंच',
    selectCategory: 'लॉगिन श्रेणी चुनें',
    govLogin: 'सरकारी / अधिकारी लॉगिन',
    citizenLogin: 'नागरिक / उपयोगकर्ता लॉगिन',
    govSupporting: 'अधिकृत सरकारी अधिकारियों के लिए',
    citizenSupporting: 'नागरिकों और सार्वजनिक उपयोगकर्ताओं के लिए',
    enterCredentials: 'प्रमाणपत्र दर्ज करें',
    userIdLabel: 'ईमेल / यूज़र आईडी',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    govPlaceholder: 'officer.env@nic.in या आधिकारिक आईडी',
    citizenPlaceholder: 'citizen.user@saamek.in या नागरिक आईडी',
    loginButton: 'लॉगिन',
    fieldRequiredError: 'कृपया अपना ईमेल / यूज़र आईडी और पासवर्ड दर्ज करें।',
    loginSuccessGov: (id: string) => `सरकारी अधिकारी (${id}) के लिए लॉगिन अनुरोध पंजीकृत।`,
    loginSuccessCitizen: (id: string) => `नागरिक / सार्वजनिक उपयोगकर्ता (${id}) के लिए लॉगिन अनुरोध पंजीकृत।`,
    govNoticeTitle: 'आधिकारिक सूचना:',
    govNotice: 'आईटी अधिनियम के तहत अधिकृत पर्यावरण कर्मियों तक पहुंच प्रतिबंधित है।',
    citizenNoticeTitle: 'नागरिक सूचना:',
    citizenNotice: 'सार्वजनिक उपयोगकर्ता पर्यावरण अलर्ट देख सकते हैं और स्थानीय अवलोकन प्रस्तुत कर सकते हैं।',
    portalVersion: 'पोर्टल v1.0',
    sslEncrypted: '256-बिट एसएसएल',
    serverTime: 'सर्वर समय (IST): सक्रिय',
    websitePolicies: 'वेबसाइट नीतियां',
    termsOfUse: 'उपयोग की शर्तें',
    privacy: 'गोपनीयता',
    helpdesk: 'सहायता केंद्र',
    copyright: '© 2026 SAAMEK पोर्टल। सर्वाधिकार सुरक्षित।',
    selectLanguage: 'भाषा',

    citizenPortalTitle: 'SAAMEK — नागरिक पर्यावरण पोर्टल',
    citizenBadge: 'नागरिक सार्वजनिक प्रवेश',
    logoutBtn: 'लॉगआउट',
    tabOverview: 'पर्यावरण अवलोकन',
    tabReport: 'पर्यावरण समस्या दर्ज करें',
    tabMap: 'पर्यावरण मानचित्र',
    tabMyReports: 'मेरी रिपोर्ट एवं ट्रैकिंग',
    tabAlerts: 'अलर्ट एवं सूचनाएं',

    overviewHeading: 'नागरिक पर्यावरण अवलोकन',
    overviewSubtitle: 'वर्तमान परिवेशी वायु गुणवत्ता, मौसम संबंधी आंकड़े और सक्रिय पर्यावरणीय स्थिति।',
    currentStatusLabel: 'वर्तमान पर्यावरणीय स्थिति',
    currentStatusValue: 'मध्यम वायु गुणवत्ता • संतोषजनक पर्यावरण',
    aqiLabel: 'वायु गुणवत्ता सूचकांक (AQI)',
    aqiCategory: 'मध्यम',
    pm25Label: 'PM2.5 स्तर',
    pm10Label: 'PM10 स्तर',
    tempLabel: 'परिवेश का तापमान',
    tempSub: 'अधिकतम: 32°C • न्यूनतम: 21°C',
    windLabel: 'पवन एवं वायुमंडलीय',
    windSub: 'दिशा: उत्तर-पश्चिम • झोंके: 14 किमी/घंटा',
    humidityLabel: 'सापेक्ष आर्द्रता',
    activeAdvisoryHeading: 'सक्रिय पर्यावरणीय स्थिति एवं परामर्श',
    overviewMockNote: 'सार्वजनिक पर्यावरण जागरूकता के लिए क्षेत्रीय निगरानी डेटा प्रदर्शित किया जा रहा है।',

    reportHeading: 'पर्यावरण समस्या दर्ज करें',
    reportSubtitle: 'उपग्रह डेटा, मौसम और वायु गुणवत्ता सेंसर के साथ मिलान के लिए स्थानीय अवलोकन दर्ज करें।',
    issueCategoryLabel: 'समस्या की श्रेणी चुनें',
    catPollution: 'वायु प्रदूषण / खराब वायु गुणवत्ता',
    catPollutionSub: 'खराब वायु गुणवत्ता, भारी प्रदूषण या दृश्यमान वायु प्रदूषण',
    catSmoke: 'धुआं / औद्योगिक उत्सर्जन',
    catSmokeSub: 'दृश्यमान धुआं, फ़ैक्टरी उत्सर्जन या औद्योगिक जलाव',
    catFire: 'वनाग्नि / वनस्पति आग',
    catFireSub: 'सक्रिय आग, वनस्पति का जलना या आग के बाद की क्षति',
    catDust: 'धूल तूफान / रेत तूफान',
    catDustSub: 'धूल तूफान, रेत तूफान या धूल धुंध की घटनाएं',
    catFlood: 'बाढ़ / जलजमाव',
    catFloodSub: 'बाढ़, जलजमाव या स्थिर पानी का जमाव',
    catHaze: 'धुंध / स्मॉग घटना',
    catHazeSub: 'घनी धुंध, शहरी स्मॉग या कम दृश्यता की स्थिति',
    catWeather: 'असामान्य मौसम घटना',
    catWeatherSub: 'अस्पष्टीकृत मौसम पैटर्न या अचानक वायुमंडलीय परिवर्तन',
    photoUploadLabel: 'तस्वीर अपलोड (साक्ष्य)',
    photoUploadHint: 'समस्या की तस्वीर संलग्न करें (PNG/JPG)',
    locationSelectLabel: 'स्थान / लैंडमार्क',
    locationPlaceholder: 'उदा. सेक्टर 14 औद्योगिक क्षेत्र, रिंग रोड बाईपास के पास',
    shortDescriptionLabel: 'संक्षिप्त विवरण',
    shortDescriptionPlaceholder: 'दृश्यमान उत्सर्जन, खुले में कचरा जलाने या डंपिंग का विवरण प्रदान करें...',
    submitReportBtn: 'रिपोर्ट सबमिट करें',
    reportSuccessMsg: 'आपका स्थानीय अवलोकन सफलतापूर्वक दर्ज कर लिया गया है।',
    viewInMyReportsBtn: 'मेरी रिपोर्ट में देखें',

    mapHeading: 'पर्यावरण मानचित्र',
    mapSubtitle: 'निगरानी केंद्रों, दर्ज घटनाओं, आग का पता लगाने और हॉटस्पॉट का भौगोलिक प्रदर्शन।',
    mapFilterAll: 'सभी संकेतक',
    mapFilterStations: 'AQ केंद्र',
    mapFilterIncidents: 'सक्रिय घटनाएं',
    mapFilterHotspots: 'हॉटस्पॉट',
    mapFilterFires: 'आग का पता',
    mapFilterReports: 'नागरिक रिपोर्ट',
    mapLegendTitle: 'मानचित्र संकेतक',
    clickToInspectHint: 'विस्तृत आंकड़े देखने के लिए मानचित्र पर किसी भी मार्कर पर क्लिक करें।',

    myReportsHeading: 'मेरी रिपोर्ट एवं ट्रैकिंग',
    myReportsSubtitle: 'अपनी दर्ज शिकायतों के 6-चरणीय सत्यापन और समाधान की प्रगति ट्रैक करें।',
    noReportsMsg: 'अभी तक कोई रिपोर्ट दर्ज नहीं की गई है। "पर्यावरण समस्या दर्ज करें" से रिपोर्ट भेजें।',
    reportIdLabel: 'रिपोर्ट आईडी',
    statusFlowTitle: 'सत्यापन एवं प्रतिक्रिया चरण',
    statusSubmitted: 'प्रस्तुत (Submitted)',
    statusUnderVerification: 'सत्यापन अधीन (Under Verification)',
    statusVerified: 'सत्यापित (Verified)',
    statusInvestigating: 'जांच जारी (Investigating)',
    statusResponseInitiated: 'कार्रवाई शुरू (Response Initiated)',
    statusResolved: 'निस्तारित (Resolved)',
    viewDetailsBtn: 'स्थिति ट्रैक करें',
    closeBtn: 'बंद करें',

    alertsHeading: 'अलर्ट एवं सूचनाएं',
    alertsSubtitle: 'सरकारी पर्यावरणीय चेतावनी, कणिका परामर्श और आग की सूचनाएं।',
    allAlertsTab: 'सभी अलर्ट',
    severityCritical: 'गंभीर (Critical)',
    severityWarning: 'चेतावनी (Warning)',
    severityAdvisory: 'परामर्श (Advisory)',
    guidelinesLabel: 'नागरिक सुरक्षा दिशानिर्देश:',
  },
  bn: {
    govIndia: 'ভারত সরকার',
    ministry: 'পরিবেশ, বন ও জলবায়ু পরিবর্তন মন্ত্রক',
    officialGateway: 'অফিসিয়াল গেটওয়ে',
    platformTitle: 'SAAMEK',
    descriptor: 'পরিবেশগত পর্যবেক্ষণ ও প্রতিক্রিয়া প্ল্যাটফর্ম',
    nicAuth: 'এনআইসি প্রমাণীকৃত',
    nationalPortal: 'জাতীয় পরিবেশ পোর্টাল',
    authority: 'কেন্দ্রীয় দূষণ ও পরিবেশ কর্তৃপক্ষ',
    gatewayTitle: 'সিঙ্গেল সাইন-অন প্রমাণীকরণ গেটওয়ে',
    secureAccess: 'সুরক্ষিত অ্যাক্সেস',
    selectCategory: 'লগইন বিভাগ নির্বাচন করুন',
    govLogin: 'সরকারি / আধিকারিক লগইন',
    citizenLogin: 'নাগরিক / ব্যবহারকারী লগইন',
    govSupporting: 'অনুমোদিত সরকারি আধিকারিকদের জন্য',
    citizenSupporting: 'নাগরিক ও সাধারণ ব্যবহারকারীদের জন্য',
    enterCredentials: 'শংসাপত্র লিখুন',
    userIdLabel: 'ইমেল / ইউজার আইডি',
    passwordLabel: 'পাসওয়ার্ড',
    passwordPlaceholder: 'আপনার পাসওয়ার্ড লিখুন',
    govPlaceholder: 'officer.env@nic.in বা আধিকারিক আইডি',
    citizenPlaceholder: 'citizen.user@saamek.in বা নাগরিক আইডি',
    loginButton: 'লগইন',
    fieldRequiredError: 'অনুগ্রহ করে আপনার ইমেল / ইউজার আইডি এবং পাসওয়ার্ড লিখুন।',
    loginSuccessGov: (id: string) => `সরকারি আধিকারিক (${id})-এর জন্য লগইন অনুরোধ নিবন্ধিত।`,
    loginSuccessCitizen: (id: string) => `নাগরিক / সাধারণ ব্যবহারকারী (${id})-এর জন্য লগইন অনুরোধ নিবন্ধিত।`,
    govNoticeTitle: 'অফিসিয়াল বিজ্ঞপ্তি:',
    govNotice: 'আইটি আইনের অধীনে অনুমোদিত পরিবেশ কর্মীদের অ্যাক্সেস সীমাবদ্ধ।',
    citizenNoticeTitle: 'নাগরিক বিজ্ঞপ্তি:',
    citizenNotice: 'সাধারণ ব্যবহারকারীরা পরিবেশগত সতর্কতা দেখতে এবং স্থানীয় পর্যবেক্ষণ জমা দিতে পারেন।',
    portalVersion: 'পোর্টাল v1.0',
    sslEncrypted: '২৫৬-বিট এসএসএল',
    serverTime: 'সার্ভার সময় (IST): সক্রিয়',
    websitePolicies: 'ওয়েবসাইট নীতি',
    termsOfUse: 'ব্যবহারের শর্তাবলী',
    privacy: 'গোপনীয়তা',
    helpdesk: 'হেল্পডেস্ক',
    copyright: '© ২০২৬ SAAMEK পোর্টাল। সর্বস্বত্ব সংরক্ষিত।',
    selectLanguage: 'ভাষা',

    citizenPortalTitle: 'SAAMEK — নাগরিক পরিবেশ পোর্টাল',
    citizenBadge: 'নাগরিক সার্বজনীন প্রবেশ',
    logoutBtn: 'লগআউট',
    tabOverview: 'পরিবেশগত বিবরণ',
    tabReport: 'পরিবেশ সমস্যা জানান',
    tabMap: 'পরিবেশগত মানচিত্র',
    tabMyReports: 'আমার রিপোর্ট ও ট্র্যাকিং',
    tabAlerts: 'সতর্কতা ও বিজ্ঞপ্তি',

    overviewHeading: 'নাগরিক পরিবেশগত বিবরণ',
    overviewSubtitle: 'বর্তমান বায়ুর গুণমান, আবহাওয়ার তথ্য এবং সক্রিয় পরিবেশগত অবস্থা।',
    currentStatusLabel: 'বর্তমান পরিবেশগত অবস্থা',
    currentStatusValue: 'মাঝারি বায়ুর মান • সন্তোষজনক পরিবেশ',
    aqiLabel: 'বায়ু গুণমান সূচক (AQI)',
    aqiCategory: 'মাঝারি',
    pm25Label: 'PM2.5 স্তর',
    pm10Label: 'PM10 স্তর',
    tempLabel: 'তাপমাত্রা',
    tempSub: 'সর্বোচ্চ: ৩২°C • সর্বনিম্ন: ২১°C',
    windLabel: 'বায়ু প্রবাহ ও বায়ুমণ্ডলীয়',
    windSub: 'দিক: উত্তর-পশ্চিম • গতি: ১৪ কিমি/ঘণ্টা',
    humidityLabel: 'আপেক্ষিক আর্দ্রতা',
    activeAdvisoryHeading: 'সক্রিয় পরিবেশগত পরামর্শ',
    overviewMockNote: 'জনসচেতনতার জন্য আঞ্চলিক পর্যবেক্ষণ তথ্য প্রদর্শিত হচ্ছে।',

    reportHeading: 'পরিবেশ সমস্যা জানান',
    reportSubtitle: 'স্যাটেলাইট ডেটা, আবহাওয়া ও বায়ু সেন্সরের সাথে সংযোগের জন্য স্থানীয় পর্যবেক্ষণ জমা দিন।',
    issueCategoryLabel: 'সমস্যার বিভাগ নির্বাচন করুন',
    catPollution: 'বায়ু দূষণ / খারাপ বায়ুর মান',
    catPollutionSub: 'খারাপ বায়ুর গুণমান, ভারী দূষণ বা দৃশ্যমান বায়ু দূষণ',
    catSmoke: 'ধোঁয়া / শিল্প নির্গমন',
    catSmokeSub: 'দৃশ্যমান ধোঁয়া, কারখানার নির্গমন বা শিল্প জ্বলন',
    catFire: 'বনের আগুন / গাছপালায় আগুন',
    catFireSub: 'সক্রিয় আগুন, জ্বলন্ত গাছপালা বা আগুন পরবর্তী ক্ষতি',
    catDust: 'ধূলিঝড় / বালিঝড়',
    catDustSub: 'ধূলিঝড়, বালিঝড় বা ধুলো কুয়াশার ঘটনা',
    catFlood: 'বন্যা / জলাবদ্ধতা',
    catFloodSub: 'বন্যা, জলাবদ্ধতা বা স্থির জলের জমাট',
    catHaze: 'ধোঁয়াশা / স্মগ ঘটনা',
    catHazeSub: 'ঘন ধোঁয়াশা, শহুরে স্মগ বা কম দৃশ্যমানতার অবস্থা',
    catWeather: 'অস্বাভাবিক আবহাওয়ার ঘটনা',
    catWeatherSub: 'অব্যাখ্যাত আবহাওয়ার নিদর্শন বা আকস্মিক বায়ুমণ্ডলীয় পরিবর্তন',
    photoUploadLabel: 'ছবি আপলোড (প্রমাণ)',
    photoUploadHint: 'সমস্যার ছবি সংযুক্ত করুন (PNG/JPG)',
    locationSelectLabel: 'অবস্থান / ল্যান্ডমার্ক',
    locationPlaceholder: 'যেমন: সেক্টর ১৪ শিল্প এলাকা, রিং রোড বাইপাসের কাছে',
    shortDescriptionLabel: 'সংক্ষিপ্ত বিবরণ',
    shortDescriptionPlaceholder: 'দৃশ্যমান নির্গমন, উন্মুক্ত পোড়ানো বা বর্জ্য জমার বিবরণ লিখুন...',
    submitReportBtn: 'রিপোর্ট জমা দিন',
    reportSuccessMsg: 'আপনার স্থানীয় পর্যবেক্ষণ সফলভাবে নথিভুক্ত হয়েছে।',
    viewInMyReportsBtn: 'আমার রিপোর্টে দেখুন',

    mapHeading: 'পরিবেশগত মানচিত্র',
    mapSubtitle: 'পর্যবেক্ষণ কেন্দ্র, নিবন্ধিত ঘটনা, অগ্নিকাণ্ড এবং হটস্পটের মানচিত্র।',
    mapFilterAll: 'সকল স্তর',
    mapFilterStations: 'AQ স্টেশন',
    mapFilterIncidents: 'সক্রিয় ঘটনা',
    mapFilterHotspots: 'হটস্পট',
    mapFilterFires: 'অগ্নিকাণ্ড শনাক্ত',
    mapFilterReports: 'নাগরিক রিপোর্ট',
    mapLegendTitle: 'মানচিত্র নির্দেশিকা',
    clickToInspectHint: 'বিস্তারিত দেখতে মানচিত্রের যেকোনো চিহ্নে ক্লিক করুন।',

    myReportsHeading: 'আমার রিপোর্ট ও ট্র্যাকিং',
    myReportsSubtitle: 'আপনার জমা দেওয়া অভিযোগের ৬-পর্যায়ের সমাধান অগ্রগতি ট্র্যাক করুন।',
    noReportsMsg: 'এখনও কোনো রিপোর্ট জমা পড়েনি। "পরিবেশ সমস্যা জানান" থেকে রিপোর্ট করুন।',
    reportIdLabel: 'রিপোর্ট আইডি',
    statusFlowTitle: 'যাচাই ও প্রতিক্রিয়া পর্যায়',
    statusSubmitted: 'জমা হয়েছে (Submitted)',
    statusUnderVerification: 'যাচাইাধীন (Under Verification)',
    statusVerified: 'যাচাইকৃত (Verified)',
    statusInvestigating: 'তদন্ত চলছে (Investigating)',
    statusResponseInitiated: 'পদক্ষেপ শুরু (Response Initiated)',
    statusResolved: 'সমাধান হয়েছে (Resolved)',
    viewDetailsBtn: 'অগ্রগতি দেখুন',
    closeBtn: 'বন্ধ করুন',

    alertsHeading: 'সতর্কতা ও বিজ্ঞপ্তি',
    alertsSubtitle: 'সরকারি পরিবেশগত সতর্কতা এবং জরুরি নির্দেশিকা।',
    allAlertsTab: 'সকল সতর্কতা',
    severityCritical: 'জরুরি (Critical)',
    severityWarning: 'সতর্কতা (Warning)',
    severityAdvisory: 'পরামর্শ (Advisory)',
    guidelinesLabel: 'নাগরিক সুরক্ষা নির্দেশিকা:',
  },
  mr: {
    govIndia: 'भारत सरकार',
    ministry: 'पर्यावरण, वन आणि हवामान बदल मंत्रालय',
    officialGateway: 'अधिकृत प्रवेशद्वार',
    platformTitle: 'SAAMEK',
    descriptor: 'पर्यावरण देखरेख व प्रतिसाद व्यासपीठ',
    nicAuth: 'एनआयसी प्रमाणित',
    nationalPortal: 'राष्ट्रीय पर्यावरण पोर्टल',
    authority: 'केंद्रीय प्रदूषण व पर्यावरण प्राधिकरण',
    gatewayTitle: 'सिंगल साइन-ऑन प्रमाणीकरण प्रवेशद्वार',
    secureAccess: 'सुरक्षित प्रवेश',
    selectCategory: 'लॉगिन श्रेणी निवडा',
    govLogin: 'शासकीय / अधिकारी लॉगिन',
    citizenLogin: 'नागरिक / वापरकर्ता लॉगिन',
    govSupporting: 'अधिकृत शासकीय अधिकाऱ्यांसाठी',
    citizenSupporting: 'नागरिक आणि सार्वजनिक वापरकर्त्यांसाठी',
    enterCredentials: 'प्रमाणपत्रे प्रविष्ट करा',
    userIdLabel: 'ईमेल / युझर आयडी',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: 'तुमचा पासवर्ड प्रविष्ट करा',
    govPlaceholder: 'officer.env@nic.in किंवा अधिकारी आयडी',
    citizenPlaceholder: 'citizen.user@saamek.in किंवा नागरिक आयडी',
    loginButton: 'लॉगिन',
    fieldRequiredError: 'कृपया तुमचा ईमेल / युझर आयडी आणि पासवर्ड प्रविष्ट करा.',
    loginSuccessGov: (id: string) => `शासकीय अधिकारी (${id}) साठी लॉगिन विनंती नोंदवली गेली.`,
    loginSuccessCitizen: (id: string) => `नागरिक / सार्वजनिक वापरकर्ता (${id}) साठी लॉगिन विनंती नोंदवली गेली.`,
    govNoticeTitle: 'अधिकृत सूचना:',
    govNotice: 'माहिती तंत्रज्ञान कायद्यांतर्गत केवळ अधिकृत पर्यावरण कर्मचाऱ्यांसाठी प्रवेश मर्यादित आहे.',
    citizenNoticeTitle: 'नागरिक सूचना:',
    citizenNotice: 'सार्वजनिक वापरकर्ते पर्यावरण सूचना पाहू शकतात आणि स्थानिक निरीक्षणे नोंदवू शकतात.',
    portalVersion: 'पोर्टल v1.0',
    sslEncrypted: '२५६-बिट एसएसएल',
    serverTime: 'सर्व्हर वेळ (IST): सक्रिय',
    websitePolicies: 'संकेतस्थळ धोरणे',
    termsOfUse: 'वापर अटी',
    privacy: 'गोपनीयता',
    helpdesk: 'मदत केंद्र',
    copyright: '© २०२६ SAAMEK पोर्टल. सर्व हक्क राखीव.',
    selectLanguage: 'भाषा',

    citizenPortalTitle: 'SAAMEK — नागरिक पर्यावरण पोर्टल',
    citizenBadge: 'नागरिक सार्वजनिक प्रवेश',
    logoutBtn: 'लॉगआउट',
    tabOverview: 'पर्यावरण आढावा',
    tabReport: 'पर्यावरण तक्रार नोंदवा',
    tabMap: 'पर्यावरण नकाशा',
    tabMyReports: 'माझ्या तक्रारी व ट्रॅकिंग',
    tabAlerts: 'सूचना व सतर्कता',

    overviewHeading: 'नागरिक पर्यावरण आढावा',
    overviewSubtitle: 'सद्य हवेची गुणवत्ता, हवामान निर्देशांक आणि सक्रिय पर्यावरणीय परिस्थिती.',
    currentStatusLabel: 'सद्य पर्यावरणीय स्थिती',
    currentStatusValue: 'मध्यम हवेची गुणवत्ता • समाधानकारक पर्यावरण',
    aqiLabel: 'हवा गुणवत्ता निर्देशांक (AQI)',
    aqiCategory: 'मध्यम',
    pm25Label: 'PM2.5 पातळी',
    pm10Label: 'PM10 पातळी',
    tempLabel: 'तापमान',
    tempSub: 'कमाल: ३२°C • किमान: २१°C',
    windLabel: 'वारा व वातावरण',
    windSub: 'दिशा: वायव्य • वेग: १४ किमी/तास',
    humidityLabel: 'सापेक्ष आर्द्रता',
    activeAdvisoryHeading: 'सक्रिय पर्यावरणीय सल्ला',
    overviewMockNote: 'जनजागृतीसाठी प्रादेशिक पर्यावरण निरीक्षण माहिती दर्शवली जात आहे.',

    reportHeading: 'पर्यावरण तक्रार नोंदवा',
    reportSubtitle: 'उपग्रह डेटा, हवामान व प्रदूषण सेन्सरशी पडताळणीसाठी स्थानिक निरीक्षण नोंदवा.',
    issueCategoryLabel: 'तक्रारीचा प्रकार निवडा',
    catPollution: 'हवा प्रदूषण / हवेची खालावलेली गुणवत्ता',
    catPollutionSub: 'हवेची खराब गुणवत्ता, तीव्र प्रदूषण किंवा दृश्यमान हवा प्रदूषण',
    catSmoke: 'धूर / औद्योगिक उत्सर्जन',
    catSmokeSub: 'दृश्यमान धूर, कारखाना उत्सर्जन किंवा औद्योगिक जळणे',
    catFire: 'जंगलातील आग / वनस्पती आग',
    catFireSub: 'सक्रिय आग, जळणारी वनस्पती किंवा आगीनंतरचे नुकसान',
    catDust: 'धुळीचे वादळ / वाळूचे वादळ',
    catDustSub: 'धुळीचे वादळ, वाळूचे वादळ किंवा धुळीच्या धुक्याच्या घटना',
    catFlood: 'पूर / जलसाठा',
    catFloodSub: 'पूर, जलसाठा किंवा साचलेल्या पाण्याचे संचय',
    catHaze: 'धुके / स्मॉग घटना',
    catHazeSub: 'दाट धुके, शहरी स्मॉग किंवा कमी दृश्यमानतेची परिस्थिती',
    catWeather: 'असामान्य हवामान घटना',
    catWeatherSub: 'अस्पष्टीकृत हवामान नमुने किंवा अचानक वायुमंडलीय बदल',
    photoUploadLabel: 'छायाचित्र जोडा (पुरावा)',
    photoUploadHint: 'समस्येचे छायाचित्र जोडा (PNG/JPG)',
    locationSelectLabel: 'स्थान / परिसर',
    locationPlaceholder: 'उदा. सेक्टर १४ औद्योगिक क्षेत्र, रिंग रोड बायपासजवळ',
    shortDescriptionLabel: 'संक्षिप्त माहिती',
    shortDescriptionPlaceholder: 'दृश्यमान उत्सर्जन, कचरा जाळणे किंवा साचलेल्या कचऱ्याचा तपशील लिहा...',
    submitReportBtn: 'तक्रार सादर करा',
    reportSuccessMsg: 'तुमचे स्थानिक निरीक्षण यशस्वीरीत्या नोंदवले गेले आहे.',
    viewInMyReportsBtn: 'माझ्या तक्रारींमध्ये पहा',

    mapHeading: 'पर्यावरण नकाशा',
    mapSubtitle: 'निरीक्षण केंद्रे, सक्रिय घटना, वणवे आणि हॉटस्पॉट्सचा भौगोलिक नकाशा.',
    mapFilterAll: 'सर्व थर',
    mapFilterStations: 'AQ केंद्रे',
    mapFilterIncidents: 'सक्रिय घटना',
    mapFilterHotspots: 'हॉटस्पॉट',
    mapFilterFires: 'आग तपासणी',
    mapFilterReports: 'नागरिक तक्रारी',
    mapLegendTitle: 'नकाशा निर्देशक',
    clickToInspectHint: 'तपशील पाहण्यासाठी नकाशावरील कोणत्याही चिन्हावर क्लिक करा.',

    myReportsHeading: 'माझ्या तक्रारी व ट्रॅकिंग',
    myReportsSubtitle: 'तुमच्या तक्रारींच्या ६ टप्प्यांमधील निवारण प्रगतीचा मागोवा घ्या.',
    noReportsMsg: 'अद्याप कोणतीही तक्रार नोंदवलेली नाही. "पर्यावरण तक्रार नोंदवा" द्वारे तक्रार करा.',
    reportIdLabel: 'तक्रार क्रमांक (ID)',
    statusFlowTitle: 'तपासणी व कारवाई टप्पे',
    statusSubmitted: 'दाखल (Submitted)',
    statusUnderVerification: 'पडताळणी सुरू (Under Verification)',
    statusVerified: 'पडताळणी पूर्ण (Verified)',
    statusInvestigating: 'तपास सुरू (Investigating)',
    statusResponseInitiated: 'कारवाई सुरू (Response Initiated)',
    statusResolved: 'निवारण झाले (Resolved)',
    viewDetailsBtn: 'प्रगती पहा',
    closeBtn: 'बंद करा',

    alertsHeading: 'सूचना व सतर्कता',
    alertsSubtitle: 'शासकीय पर्यावरणीय इशारे आणि सार्वजनिक सुरक्षा मार्गदर्शक तत्त्वे.',
    allAlertsTab: 'सर्व इशारे',
    severityCritical: 'अतिगंभीर (Critical)',
    severityWarning: 'चेतावणी (Warning)',
    severityAdvisory: 'सल्ला (Advisory)',
    guidelinesLabel: 'नागरिक सुरक्षा मार्गदर्शक तत्त्वे:',
  },
  ta: {
    govIndia: 'இந்திய அரசு',
    ministry: 'சுற்றுச்சூழல், வனம் மற்றும் பருவநிலை மாற்ற அமைச்சகம்',
    officialGateway: 'அதிகாரப்பூர்வ நுழைவாயில்',
    platformTitle: 'SAAMEK',
    descriptor: 'சுற்றுச்சூழல் கண்காணிப்பு மற்றும் பதிலளிப்பு தளம்',
    nicAuth: 'NIC அங்கீகரிக்கப்பட்டது',
    nationalPortal: 'தேசிய சுற்றுச்சூழல் தளம்',
    authority: 'மத்திய மாசு மற்றும் சுற்றுச்சூழல் ஆணையம்',
    gatewayTitle: 'ஒருங்கிணைந்த உள்நுழைவு அங்கீகார நுழைவாயில்',
    secureAccess: 'பாதுகாப்பான அணுகல்',
    selectCategory: 'உள்நுழைவு வகையைத் தேர்ந்தெடுக்கவும்',
    govLogin: 'அரசு / அலுவலர் உள்நுழைவு',
    citizenLogin: 'குடிமக்கள் / பயனர் உள்நுழைவு',
    govSupporting: 'அங்கீகரிக்கப்பட்ட அரசு அலுவலர்களுக்கு',
    citizenSupporting: 'குடிமக்கள் மற்றும் பொது பயனர்களுக்கு',
    enterCredentials: 'சான்றுகளை உள்ளிடவும்',
    userIdLabel: 'மின்னஞ்சல் / பயனர் ஐடி',
    passwordLabel: 'கடவுச்சொல்',
    passwordPlaceholder: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
    govPlaceholder: 'officer.env@nic.in அல்லது அலுவலர் ஐடி',
    citizenPlaceholder: 'citizen.user@saamek.in அல்லது குடிமக்கள் ஐடி',
    loginButton: 'உள்நுழைக',
    fieldRequiredError: 'தயவுசெய்து உங்கள் மின்னஞ்சல் / பயனர் ஐடி மற்றும் கடவுச்சொல்லை உள்ளிடவும்.',
    loginSuccessGov: (id: string) => `அரசு அலுவலர் (${id}) க்கான உள்நுழைவு கோரிக்கை பதிவு செய்யப்பட்டது.`,
    loginSuccessCitizen: (id: string) => `குடிமக்கள் / பொது பயனர் (${id}) க்கான உள்நுழைவு கோரிக்கை பதிவு செய்யப்பட்டது.`,
    govNoticeTitle: 'அதிகாரப்பூர்வ அறிவிப்பு:',
    govNotice: 'தகவல் தொழில்நுட்ப சட்டத்தின் கீழ் அங்கீகரிக்கப்பட்ட சுற்றுச்சூழல் பணியாளர்களுக்கு மட்டுமே அனுமதி உண்டு.',
    citizenNoticeTitle: 'குடிமக்கள் அறிவிப்பு:',
    citizenNotice: 'பொது பயனர்கள் சுற்றுச்சூழல் எச்சரிக்கைகளைப் பெறலாம் மற்றும் உள்ளூர் அவதானிப்புகளைச் சமர்ப்பிக்கலாம்.',
    portalVersion: 'போர்டல் v1.0',
    sslEncrypted: '256-பிட் SSL',
    serverTime: 'சேவையக நேரம் (IST): செயலில் உள்ளது',
    websitePolicies: 'வலைத்தள கொள்கைகள்',
    termsOfUse: 'பயன்பாட்டு விதிமுறைகள்',
    privacy: 'தனியுரிமை',
    helpdesk: 'உதவி மையம்',
    copyright: '© 2026 SAAMEK தளம். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    selectLanguage: 'மொழி',

    citizenPortalTitle: 'SAAMEK — பொதுமக்கள் சுற்றுச்சூழல் தளம்',
    citizenBadge: 'பொதுமக்கள் நேரடி அணுகல்',
    logoutBtn: 'வெளியேறு',
    tabOverview: 'சுற்றுச்சூழல் கண்ணோட்டம்',
    tabReport: 'சுற்றுச்சூழல் புகாரளி',
    tabMap: 'சுற்றுச்சூழல் வரைபடம்',
    tabMyReports: 'எனது புகார்கள் & கண்காணிப்பு',
    tabAlerts: 'எச்சரிக்கைகள் & அறிவிப்புகள்',

    overviewHeading: 'பொதுமக்கள் சுற்றுச்சூழல் கண்ணோட்டம்',
    overviewSubtitle: 'தற்போதைய காற்றின் தரம், வானிலை தகவல்கள் மற்றும் சுற்றுச்சூழல் நிலை.',
    currentStatusLabel: 'தற்போதைய சுற்றுச்சூழல் நிலை',
    currentStatusValue: 'மிதமான காற்றின் தரம் • திருப்திகரமான சூழல்',
    aqiLabel: 'காற்று தரக் குறியீடு (AQI)',
    aqiCategory: 'மிதமானது (Moderate)',
    pm25Label: 'PM2.5 அளவு',
    pm10Label: 'PM10 அளவு',
    tempLabel: 'வெப்பநிலை',
    tempSub: 'அதிகபட்சம்: 32°C • குறைந்தபட்சம்: 21°C',
    windLabel: 'காற்று & வளிமண்டலம்',
    windSub: 'திசை: வடமேற்கு • வேகம்: 14 கி.மீ/மணி',
    humidityLabel: 'காற்றின் ஈரப்பதம்',
    activeAdvisoryHeading: 'செயலில் உள்ள சுற்றுச்சூழல் எச்சரிக்கை',
    overviewMockNote: 'பொதுமக்களின் விழிப்புணர்வுக்காக பிராந்திய கண்காணிப்பு தரவு காட்டப்படுகிறது.',

    reportHeading: 'சுற்றுச்சூழல் புகாரளி',
    reportSubtitle: 'செயற்கைக்கோள் தரவு, வானிலை மற்றும் காற்றுத் தர உணரிகளுடன் இணைக்க உள்ளூர் அவதானிப்புகளைச் சமர்ப்பிக்கவும்.',
    issueCategoryLabel: 'புகார் வகையைத் தேர்ந்தெடுக்கவும்',
    catPollution: 'காற்று மாசுபாடு / மோசமான காற்றின் தரம்',
    catPollutionSub: 'மோசமான காற்றின் தரம், அதிக மாசுபாடு அல்லது தெரியும் காற்று மாசுபாடு',
    catSmoke: 'புகை / தொழிற்துறை உமிழ்வு',
    catSmokeSub: 'தெரியும் புகை, தொழிற்சாலை உமிழ்வு அல்லது தொழிற்துறை எரிப்பு',
    catFire: 'காட்டுத் தீ / தாவர தீ',
    catFireSub: 'செயலில் உள்ள தீ, எரியும் தாவரங்கள் அல்லது தீ பின் சேதம்',
    catDust: 'புழுதிப் புயல் / மண் புயல்',
    catDustSub: 'புழுதிப் புயல்கள், மண் புயல்கள் அல்லது புழுதி மூடுபனி நிகழ்வுகள்',
    catFlood: 'வெள்ளம் / நீர்தேக்கம்',
    catFloodSub: 'வெள்ளம், நீர்தேக்கம் அல்லது தேங்கிய நீர் குவிப்பு',
    catHaze: 'மூடுபனி / புகைமூட்டம் நிகழ்வு',
    catHazeSub: 'அடர்த்தியான மூடுபனி, நகர்ப்புற புகைமூட்டம் அல்லது குறைந்த தெரிவுத்திறன் நிலைமைகள்',
    catWeather: 'அசாதாரண வானிலை நிகழ்வு',
    catWeatherSub: 'விவரிக்க முடியாத வானிலை வடிவங்கள் அல்லது திடீர் வளிமண்டல மாற்றங்கள்',
    photoUploadLabel: 'புகைப்படம் பதிவேற்றம் (சான்று)',
    photoUploadHint: 'புகைப்படத்தை இணைக்கவும் (PNG/JPG)',
    locationSelectLabel: 'இடம் / அடையாளம்',
    locationPlaceholder: 'எ.கா: தொழிற்பேட்டை பகுதி, ரிங் ரோடு பைபாஸ் அருகில்',
    shortDescriptionLabel: 'சுருக்கமான விளக்கம்',
    shortDescriptionPlaceholder: 'தெரியும் உமிழ்வு, திறந்தவெளியில் எரித்தல் அல்லது கழிவுக் குவிப்பு பற்றிய விவரங்களை உள்ளிடவும்...',
    submitReportBtn: 'புகாரைச் சமர்ப்பிக்கவும்',
    reportSuccessMsg: 'உங்கள் உள்ளூர் அவதானிப்பு வெற்றிகரமாகப் பதிவு செய்யப்பட்டது.',
    viewInMyReportsBtn: 'எனது புகார்களில் பார்க்க',

    mapHeading: 'சுற்றுச்சூழல் வரைபடம்',
    mapSubtitle: 'கண்காணிப்பு நிலையங்கள், புகார்கள், தீ மற்றும் முக்கிய பகுதிகளின் வரைபடம்.',
    mapFilterAll: 'அனைத்து நிலைகள்',
    mapFilterStations: 'AQ நிலையங்கள்',
    mapFilterIncidents: 'செயலில் உள்ள சம்பவங்கள்',
    mapFilterHotspots: 'முக்கிய பகுதிகள்',
    mapFilterFires: 'தீ கண்டறிதல்',
    mapFilterReports: 'பொதுமக்கள் புகார்கள்',
    mapLegendTitle: 'வரைபட வழிகாட்டி',
    clickToInspectHint: 'விரிவான தகவல்களைப் பார்க்க வரைபடத்தில் ஏதேனும் ஒரு குறியீட்டைக் கிளிக் செய்யவும்.',

    myReportsHeading: 'எனது புகார்கள் & கண்காணிப்பு',
    myReportsSubtitle: 'உங்கள் புகார்களின் 6-நிலை தீர்வு முன்னேற்றத்தைக் கண்காணிக்கவும்.',
    noReportsMsg: 'இதுவரை புகார்கள் எதுவும் சமர்ப்பிக்கப்படவில்லை.',
    reportIdLabel: 'புகார் எண் (ID)',
    statusFlowTitle: 'சரிபார்ப்பு & தீர்வு நிலைகள்',
    statusSubmitted: 'சமர்ப்பிக்கப்பட்டது (Submitted)',
    statusUnderVerification: 'சரிபார்ப்பில் உள்ளது (Under Verification)',
    statusVerified: 'சரிபார்க்கப்பட்டது (Verified)',
    statusInvestigating: 'விசாரணையில் உள்ளது (Investigating)',
    statusResponseInitiated: 'நடவடிக்கை தொடங்கப்பட்டது (Response Initiated)',
    statusResolved: 'தீர்வு காணப்பட்டது (Resolved)',
    viewDetailsBtn: 'முன்னேற்றத்தைக் காண்க',
    closeBtn: 'மூடு',

    alertsHeading: 'எச்சரிக்கைகள் & அறிவிப்புகள்',
    alertsSubtitle: 'அரசாங்க சுற்றுச்சூழல் எச்சரிக்கைகள் மற்றும் பாதுகாப்பு வழிகாட்டுதல்கள்.',
    allAlertsTab: 'அனைத்து எச்சரிக்கைகள்',
    severityCritical: 'மிகவும் தீவிரமானது (Critical)',
    severityWarning: 'எச்சரிக்கை (Warning)',
    severityAdvisory: 'ஆலோசனை (Advisory)',
    guidelinesLabel: 'பொதுமக்கள் பாதுகாப்பு வழிகாட்டுதல்கள்:',
  },
};
