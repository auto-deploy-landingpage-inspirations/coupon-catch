export function cleanDataWithRegex(text: string, regexPattern: RegExp) {
    return text.replace(regexPattern, '');
  }