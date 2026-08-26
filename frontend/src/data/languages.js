export const languages = [
  { name: 'English', nativeName: 'English', speechLocale: 'en-IN' },
  { name: 'Hindi', nativeName: 'हिन्दी', speechLocale: 'hi-IN' },
  { name: 'Tamil', nativeName: 'தமிழ்', speechLocale: 'ta-IN' },
  { name: 'Bengali', nativeName: 'বাংলা', speechLocale: 'bn-IN' },
  { name: 'Malayalam', nativeName: 'മലയാളം', speechLocale: 'ml-IN' },
  { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechLocale: 'pa-IN' },
  { name: 'Marathi', nativeName: 'मराठी', speechLocale: 'mr-IN' },
  { name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechLocale: 'kn-IN' },
]

export function getLanguage(name) {
  return languages.find((language) => language.name === name) || languages[0]
}
