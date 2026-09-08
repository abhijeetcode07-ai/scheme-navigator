import { getCopy, getLanguage } from './languages'

export function routeCopy(language = 'English') {
  const copy = getCopy(language)
  const name = getLanguage(language).name
  return {
    name,
    nav: copy.nav || {},
    input: copy.input || {},
    results: copy.results || {},
    detail: copy.detail || {},
    checklist: copy.checklist || {},
  }
}

export const commonUi = {
  English: { back: 'Back', home: 'Home', official: 'Open official portal', verify: 'Verify on official portal', notStated: 'Not stated in record', support: 'See benefits', records: 'records in route', documents: 'document signals' },
  Hindi: { back: 'वापस', home: 'होम', official: 'आधिकारिक पोर्टल खोलें', verify: 'आधिकारिक पोर्टल पर जाँचें', notStated: 'रिकॉर्ड में नहीं बताया गया', support: 'लाभ देखें', records: 'इस मार्ग में रिकॉर्ड', documents: 'दस्तावेज़ संकेत' },
  Marathi: { back: 'मागे', home: 'मुख्यपृष्ठ', official: 'अधिकृत पोर्टल उघडा', verify: 'अधिकृत पोर्टलवर तपासा', notStated: 'नोंदीत नमूद नाही', support: 'लाभ पहा', records: 'या मार्गातील नोंदी', documents: 'कागदपत्र संकेत' },
  Tamil: { back: 'பின்செல்', home: 'முகப்பு', official: 'அதிகாரப்பூர்வ தளத்தைத் திறக்கவும்', verify: 'அதிகாரப்பூர்வ தளத்தில் சரிபார்க்கவும்', notStated: 'பதிவில் குறிப்பிடப்படவில்லை', support: 'நன்மைகளைப் பார்க்கவும்', records: 'இந்தப் பாதையின் பதிவுகள்', documents: 'ஆவணக் குறிப்புகள்' },
  Kannada: { back: 'ಹಿಂದೆ', home: 'ಮುಖಪುಟ', official: 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ', verify: 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ', notStated: 'ದಾಖಲೆಯಲ್ಲಿ ಹೇಳಿಲ್ಲ', support: 'ಪ್ರಯೋಜನಗಳನ್ನು ನೋಡಿ', records: 'ಈ ಮಾರ್ಗದ ದಾಖಲೆಗಳು', documents: 'ದಾಖಲೆ ಸೂಚನೆಗಳು' },
  Malayalam: { back: 'തിരികെ', home: 'ഹോം', official: 'ഔദ്യോഗിക പോർട്ടൽ തുറക്കുക', verify: 'ഔദ്യോഗിക പോർട്ടലിൽ പരിശോധിക്കുക', notStated: 'രേഖയിൽ പറഞ്ഞിട്ടില്ല', support: 'ആനുകൂല്യങ്ങൾ കാണുക', records: 'ഈ വഴിയിലെ രേഖകൾ', documents: 'രേഖാ സൂചനകൾ' },
  Bengali: { back: 'ফিরে যান', home: 'হোম', official: 'সরকারি পোর্টাল খুলুন', verify: 'সরকারি পোর্টালে যাচাই করুন', notStated: 'রেকর্ডে উল্লেখ নেই', support: 'সুবিধা দেখুন', records: 'এই পথের রেকর্ড', documents: 'নথির সংকেত' },
  Punjabi: { back: 'ਵਾਪਸ', home: 'ਮੁੱਖ ਪੰਨਾ', official: 'ਸਰਕਾਰੀ ਪੋਰਟਲ ਖੋਲ੍ਹੋ', verify: 'ਸਰਕਾਰੀ ਪੋਰਟਲ ਉੱਤੇ ਜਾਂਚੋ', notStated: 'ਰਿਕਾਰਡ ਵਿੱਚ ਨਹੀਂ ਦੱਸਿਆ', support: 'ਲਾਭ ਵੇਖੋ', records: 'ਇਸ ਰਸਤੇ ਦੇ ਰਿਕਾਰਡ', documents: 'ਦਸਤਾਵੇਜ਼ ਸੰਕੇਤ' },
}

export function uiText(language = 'English') {
  const name = getLanguage(language).name
  return commonUi[name] || commonUi.English
}
