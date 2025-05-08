function adjustDirection() {
    // Get the current language from the <html> tag
    const htmlLang = document.documentElement.lang;

    // Check if the language is RTL (e.g., Arabic, Hebrew, etc.)
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    if (rtlLanguages.includes(htmlLang)) {
      document.documentElement.setAttribute('dir', 'rtl'); // Set direction to RTL
    } else {
      document.documentElement.setAttribute('dir', 'ltr'); // Set direction to LTR
    }
  }

  // Observe changes to the <html> tag's lang attribute
  const observer = new MutationObserver(() => {
    adjustDirection();
  });

  // Start observing the <html> tag for attribute changes
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // Initial adjustment based on the current language
  adjustDirection();