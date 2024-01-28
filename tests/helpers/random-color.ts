export function getRandomHexColor(): string {
  const length = 6
  let result = '#'
  const characters = '0123456789ABCDEF'
  const charactersLength = characters.length
  Array.from({ length }).forEach(() => {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  })

  return result
}