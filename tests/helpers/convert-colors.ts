export function convertHexToRgbColor(color: string): string {
  let hex = color.replace(/^#/, '')
  // convert values to RGB
  const bigint = parseInt(hex, 16) //convert the input value to hex value
  //move 16 bits on the right and then give you the first 8 bits of your number
  const [r, g, b] = [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255
  ]

  return `rgb(${r}, ${g}, ${b})`
}