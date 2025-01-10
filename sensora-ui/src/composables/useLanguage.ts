enum SupportedLanguages {
  EN = 'en-US',
  DE = 'de-DE',
}

const getLanguage = (): SupportedLanguages => {
  const cacheLang = localStorage.getItem('language')

  let langToSet
  if (cacheLang) {
    langToSet = Object.values(SupportedLanguages).includes(cacheLang as SupportedLanguages)
      ? (cacheLang as SupportedLanguages)
      : SupportedLanguages.EN
  } else {
    const browserLang = navigator.language
    langToSet = Object.values(SupportedLanguages).includes(browserLang as SupportedLanguages)
      ? (browserLang as SupportedLanguages)
      : SupportedLanguages.EN
  }
  return langToSet
}

export { getLanguage, SupportedLanguages }
