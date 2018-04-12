/**
 * 大于10， 10进制，8进制，2进制都是回文的所有数字中最小的数字。
 */
export function minPalindromeNumber(): number {
  // 对于正整数，可以直接使用toString
  let i = 11
  while(true) {
    if (isPalindrome(i.toString(2)) && isPalindrome(i.toString(8)) && isPalindrome(i.toString(10))) {
      return i
    }
    i += 2
  }
}

export function toBinary(n: number): string {
  return (n >>> 0).toString(2)
}


function isPalindrome(s: string): boolean {
  return s.split('').reverse().join('') === s
}

// 'a 𝌆 b'
export function reverse(s: string): string {
  return s.split('').reverse().join('')
}


/**
 * 国名接龙
 */

const countries = ["Brazil", "Croatia", "Mexico", "Cameroon",
"Spain", "Netherlands", "Chile", "Australia",
"Colombia", "Greece", "Cote d'Ivoire", "Japan",
"Uruguay", "Costa Rica", "England", "Italy",
"Switzerland", "Ecuador", "France", "Honduras",
"Argentina", "Bosnia and Herzegovina", "Iran",
"Nigeria", "Germany", "Portugal", "Ghana",
"USA", "Belgium", "Algeria", "Russia",
"Korea Republic"]


export function longest(): string[] {
  let result: {[k: string]: string[]} = {};

  return []
}
