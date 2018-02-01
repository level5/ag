function promise(value) {
  return new Promise((f,r) => {
    setTimeout(() => {
      f(value)
    }, 100)
  })
}


(async function() {
  return await [promise(11), promise(12)]
})().then(d => console.log(d))
