function p(input: any[], result: any[], fn: (...args: any[]) => void) {
  if (input.length == 0) {
    fn(...result)
    return
  }
  for (let i = 0; i < input.length; i++) {
    result[result.length - input.length] = input[i]
    let newInput = input.slice(0, i).concat(input.slice(i + 1))
    p(newInput, result, fn)
  }
}

function permutations(input: any[], fn: (...args: any[]) => void): void {
  p(input, new Array<any>(input.length), console.log)
}


