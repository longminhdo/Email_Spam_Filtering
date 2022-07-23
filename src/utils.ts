import * as fs from "fs"

const exportMapToJson = (map: any, filename: string) => {
  const obj = Object.fromEntries(map)
  const data = JSON.stringify(obj)
  //   console.log(data);
  fs.writeFile(`${filename}.json`, data, (err) => {
    if (err) {
      throw err
    }
    console.log("JSON data is saved.")
  })
}

const mapSortingByValues = (map: any, mode: string) => {
  if (mode === "increase") {
    return new Map([...map.entries()].sort((a, b) => a[1] - b[1]))
  }

  if (mode === "decrease") {
    return new Map([...map.entries()].sort((a, b) => b[1] - a[1]))
  }

  return "Wrong input"
}

export { exportMapToJson, mapSortingByValues }
