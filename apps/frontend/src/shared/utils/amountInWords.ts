/**
 * Converts a numeric amount into Indian Currency Words (Rupees & Paise)
 * Example: 7450.50 => "Seven Thousand Four Hundred Fifty Rupees and Fifty Paise Only"
 */
export function numberToWordsRupees(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'Zero Rupees Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const twoDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensMultiple = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanThousand = (num: number): string => {
    let str = '';
    if (num >= 100) {
      str += singleDigits[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 10 && num <= 19) {
      str += twoDigits[num - 10] + ' ';
    } else if (num >= 20) {
      str += tensMultiple[Math.floor(num / 10)] + ' ';
      if (num % 10 > 0) {
        str += singleDigits[num % 10] + ' ';
      }
    } else if (num > 0) {
      str += singleDigits[num] + ' ';
    }
    return str;
  };

  const integerPart = Math.floor(Math.abs(amount));
  const decimalPart = Math.round((Math.abs(amount) - integerPart) * 100);

  let rupeesStr = '';
  let temp = integerPart;

  const crore = Math.floor(temp / 10000000);
  temp %= 10000000;
  const lakh = Math.floor(temp / 100000);
  temp %= 100000;
  const thousand = Math.floor(temp / 1000);
  temp %= 1000;

  if (crore > 0) {
    rupeesStr += convertLessThanThousand(crore) + 'Crore ';
  }
  if (lakh > 0) {
    rupeesStr += convertLessThanThousand(lakh) + 'Lakh ';
  }
  if (thousand > 0) {
    rupeesStr += convertLessThanThousand(thousand) + 'Thousand ';
  }
  if (temp > 0) {
    rupeesStr += convertLessThanThousand(temp);
  }

  rupeesStr = rupeesStr.trim() + ' Rupees';

  let paiseStr = '';
  if (decimalPart > 0) {
    paiseStr = ' and ' + convertLessThanThousand(decimalPart).trim() + ' Paise';
  }

  return `${rupeesStr}${paiseStr} Only`;
}
