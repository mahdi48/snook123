// Persian numerals and formatting utilities

export const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(input: number | string | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const digit = parseInt(char, 10);
    if (!isNaN(digit) && digit >= 0 && digit <= 9) {
      result += PERSIAN_DIGITS[digit];
    } else {
      result += char;
    }
  }
  return result;
}

export function formatPersianScore(score: number): { text: string; isNegative: boolean } {
  const isNegative = score < 0;
  const absScore = Math.abs(score);
  const persianDigits = toPersianDigits(absScore);
  
  return {
    text: isNegative ? `${persianDigits}-` : persianDigits,
    isNegative,
  };
}

export function formatPercentage(numerator: number, denominator: number): string {
  if (!denominator || denominator <= 0) return '۰٪';
  const percent = Math.round((numerator / denominator) * 100);
  return `${toPersianDigits(percent)}٪`;
}

export const SNOOKER_FOUL_REASONS = [
  {
    id: 'in_off',
    titleFa: 'پاکت شدن کیوبال (In-off)',
    defaultPenalty: 4,
    descriptionFa: 'افتادن توپ سفید در پاکت میز',
  },
  {
    id: 'miss_cue',
    titleFa: 'عدم اصابت به توپ هدف (Miss)',
    defaultPenalty: 4,
    descriptionFa: 'کیوبال به هیچ توپی یا توپ نوبت برخورد نکرد',
  },
  {
    id: 'wrong_first_hit',
    titleFa: 'برخورد اشتباه اول',
    defaultPenalty: 4,
    descriptionFa: 'اولین برخورد کیوبال به توپ غیرمجاز بود',
  },
  {
    id: 'foul_blue',
    titleFa: 'خطا روی توپ آبی (Blue)',
    defaultPenalty: 5,
    descriptionFa: 'پاکت شدن یا برخورد غیرمجاز با توپ آبی',
  },
  {
    id: 'foul_pink',
    titleFa: 'خطا روی توپ صورتی (Pink)',
    defaultPenalty: 6,
    descriptionFa: 'پاکت شدن یا برخورد غیرمجاز با توپ صورتی',
  },
  {
    id: 'foul_black',
    titleFa: 'خطا روی توپ مشکی (Black)',
    defaultPenalty: 7,
    descriptionFa: 'پاکت شدن یا برخورد غیرمجاز با توپ مشکی',
  },
  {
    id: 'ball_off_table',
    titleFa: 'خروج توپ از میز',
    defaultPenalty: 4,
    descriptionFa: 'پرتاب شدن هر توپی به خارج از سطح میز بازی',
  },
  {
    id: 'push_or_touch',
    titleFa: 'پوش شات یا لمس غیرمجاز',
    defaultPenalty: 4,
    descriptionFa: 'ضربه ممتد چوب یا تماس دست و لباس با توپ‌ها',
  },
];
