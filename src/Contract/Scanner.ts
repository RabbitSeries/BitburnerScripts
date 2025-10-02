import type { CodingContractName, CodingContractObject, NS } from "@ns"
// import { ScanAllServers } from "/Hack/HackHelpers"
// Don't import {type NS} from "@ns"
// instead import type {NS} from "@ns"
export async function main(ns: NS) {
    const ContractName = "Square Root"
    if (ns.args.length === 0) {
        // ================================================================Test
        if (RunTests(ns, ContractName)) {
            ns.tprint("Success")
        } else {
            ns.tprint("Failed")
        }
    } else {
        // ================================================================Dev
        const filename = ns.codingcontract.createDummyContract(ContractName)
        const contract = ns.codingcontract.getContract(filename, "home")
        ns.rm(filename)
        await ns.prompt(contract.type + "\n" + contract.description)
        const result = ContractSolves[contract.type](contract)
        const submit = await ns.prompt(`${result}`)
        if (!submit) {
            return
        }
        if (!result || contract.submit(result).trim().length === 0) {
            ns.tprint("Faild on: ", contract.data)
            ns.tprint("Solve: ", result)
        }
        await ns.prompt("Remain: " + contract.numTriesRemaining())
    }
}
export function RunTests(ns: NS, ContractName: string | CodingContractName) {
    return Array.from({ length: 100 }).map(() => {
        try {
            const filename = ns.codingcontract.createDummyContract(ContractName)
            const contract = ns.codingcontract.getContract(filename, "home")
            const result = ContractSolves[contract.type](contract)
            ns.rm(filename)
            if (!result || contract.submit(result).trim().length === 0) {
                ns.tprint("Faild on: ", contract.data)
                ns.tprint("Solve: ", result)
                return false
            }
            return true
        } catch (e) {
            ns.tprint(e)
            return false
        }
    }).reduce((a, b) => a && b, true)
}
const AlgorithmicStockTraderSolver = (TransN: number, prices: number[]): number => {
    const DayN = prices.length
    prices = [0, ...prices] /* Index from 1 */
    const holding = Array.from({ length: DayN + 1 }, () => Array(TransN + 1).fill(0)),
        sold = Array.from({ length: DayN + 1 }, () => Array(TransN + 1).fill(0))
    for (let day = 1; day <= DayN; day++) {
        for (let trans = 0; trans <= TransN; trans++) {
            holding[day][trans] = Math.max(day > 1 ? holding[day - 1][trans] : -Infinity, sold[day - 1][trans] - prices[day])
            sold[day][trans] = Math.max(sold[day - 1][trans], (day > 1 && trans > 0) ? holding[day - 1][trans - 1] + prices[day] : -Infinity)
        }
    }
    return sold[DayN][TransN]
}
// Solved 12/28
export const ContractSolves: Record<CodingContractName, (contract: CodingContractObject) => string | null> = {
    "Find Largest Prime Factor": () => null,
    "Subarray with Maximum Sum": () => null,
    "Total Ways to Sum": (contract) => {
        const num = contract.data as number
        const count = Array.from<number[]>({ length: num + 1 }).map(() => new Map<number, number>());
        count[0].set(0, 1)
        for (let i = 1; i <= num; i++) {
            for (let j = i; j <= num; j++) {
                for (const [contains, ways] of count[j - i]) {
                    count[j].set(contains + 1, (count[j].get(contains + 1) ?? 0) + ways)
                }
            }
        }
        return count[num].entries()
            .filter(([contains]) => contains >= 2)
            .map(([, ways]) => ways)
            .reduce((a, b) => a + b, 0).toString()
    },
    "Total Ways to Sum II": (contract) => {
        const data = contract.data as (number | number[])[]
        const num = data[0] as number, part = data[1] as number[]
        const ways = Array.from({ length: num + 1 }, () => 0)
        ways[0] = 1
        for (let i = 1; i <= part.length; i++) {
            for (let j = part[i - 1]; j <= num; j++) {
                ways[j] += ways[j - part[i - 1]]
            }
        }
        return ways[num].toString()
    },
    "Spiralize Matrix": (contract) => {
        const data = contract.data as number[][]
        const rows = data.length, cols = data[0].length
        const visited = Array.from({ length: rows }, () => Array.from<boolean>({ length: cols }).fill(false))
        let direction = 0, i = 0, j = 0
        const dx = [0, 1, 0, -1], dy = [1, 0, -1, 0]
        const result: number[] = []
        const isValid = (nextI: number, nextJ: number) => nextI >= 0 && nextI < rows && nextJ >= 0 && nextJ < cols
        while (isValid(i, j) && !visited[i][j]) {
            visited[i][j] = true
            result.push(data[i][j])
            const nextI = i + dx[direction], nextJ = j + dy[direction]
            if (!isValid(nextI, nextJ) || visited[nextI][nextJ]) {
                direction = (direction + 1) % 4
            }
            i += dx[direction]
            j += dy[direction]
        }
        return result.toString()
    },
    "Array Jumping Game": () => null,
    "Array Jumping Game II": () => null,
    "Merge Overlapping Intervals": () => null,
    "Generate IP Addresses": () => null,
    "Algorithmic Stock Trader I": (contract) => {
        const parsed = contract.data as number[]
        let minBuyPrice = Infinity, profit = -Infinity
        for (const price of parsed) {
            minBuyPrice = Math.min(price, minBuyPrice)
            profit = Math.max(profit, price - minBuyPrice)
        }
        return Math.max(profit, 0).toString()
    },
    "Algorithmic Stock Trader II": (contract) => {
        const parsed = contract.data as number[]
        const prices = [Infinity, ...parsed]
        return prices.map((v, i) => v - prices[i - 1]).filter(v => v > 0).reduce((a, b) => a + b, 0).toString()
    },
    "Algorithmic Stock Trader III": (contract) => AlgorithmicStockTraderSolver(2, contract.data as number[]).toString(),
    "Algorithmic Stock Trader IV": (contract) => {
        const parsed = contract.data as (number | number[])[]
        return AlgorithmicStockTraderSolver(parsed[0] as number, parsed[1] as number[]).toString()
    },
    "Minimum Path Sum in a Triangle": () => null,
    "Unique Paths in a Grid I": () => null,
    "Unique Paths in a Grid II": () => null,
    "Shortest Path in a Grid": () => null,
    "Sanitize Parentheses in Expression": () => null,
    "Find All Valid Math Expressions": () => null,
    "HammingCodes: Integer to Encoded Binary": () => null,
    "HammingCodes: Encoded Binary to Integer": () => null,
    "Proper 2-Coloring of a Graph": () => null,
    "Compression I: RLE Compression": (contract) => {
        const data = contract.data as string
        let index = 0
        const result: { len: number, char: string }[] = []
        while (index < data.length) {
            if (result.length === 0 || data[index] !== data[index - 1] || result.slice(-1)[0].len >= 9) {
                result.push({ len: 1, char: data[index] })
            } else {
                result.slice(-1)[0].len++
            }
            index++
        }
        return result.map(({ len, char }) => `${len}${char}`).join("")
    },
    "Compression II: LZ Decompression": (contract) => {
        const data = contract.data as string
        let result = ""
        let index = 0
        let isReference = false
        while (index < data.length) {
            if (isReference) {
                const len = data[index].charCodeAt(0) - "0".charCodeAt(0)
                index++
                if (len !== 0) {
                    const offset = data[index].charCodeAt(0) - "0".charCodeAt(0)
                    const content = result.slice(-offset)
                    // Copy len/conten.length's content 
                    // Remain length in content is len%content.length, index apply -1 
                    // End index is excluded in slice api, apply + 1
                    result += Array.from({ length: Math.floor(len / content.length) }, () => content).join("") + content.slice(0, len % content.length)
                    index++
                }
                isReference = false
            } else {
                const len = data[index].charCodeAt(0) - "0".charCodeAt(0)
                result += data.slice(index + 1, index + 1 + len)
                index += len + 1
                isReference = true
            }
        }
        return result
    },
    "Compression III: LZ Compression": (contract) => {
        const data = contract.data as string
        type state = {
            index: number,
            isReference: boolean
            content: string // Carry this state's content information, this won't be hashed. This content should keep the same property with mapped value.
        }
        const key = (s: state) => `${s.index},${s.isReference}`
        const findLongestCommon = (preEnd: number) => {
            let res: { len: number, pre: number }[] = []
            let maxLen = -Infinity
            for (let i = 1; i <= 9; i++) { // pre
                const pre = preEnd - (i - 1)
                if (pre < 0) { break }
                for (let j = 0; j < 9; j++) {
                    const content = data.slice(pre, pre + j + 1)
                    if (data.slice(preEnd + 1).startsWith(content) && content.length >= maxLen) {
                        if (content.length > maxLen) {
                            res = []
                        }
                        res.push({ len: content.length, pre: i })
                        maxLen = content.length
                    }
                }
            }
            return res
        }
        const start: state = {
            index: -1,
            isReference: true,
            content: ""
        }
        // const endKey = key({index: data.length-1, isReference : true | false, content : any})
        // shortest[state] => shortest[state]+nextState.length
        // nextState: not isReference-> nextReference -> longest common string
        //            isReference    -> keep raw      -> i~n compress
        const shortest = new Map<string, number>([[key(start), 0]]) // HashKey => minLength
        const q: state[] = [start]
        const sorter = (a: state, b: state) => a.index === b.index ? a.content.length - b.content.length : a.index - b.index
        const heappush = (nextState: state) => {
            const nextKey = key(nextState)
            if (!shortest.has(nextKey) || shortest.get(nextKey)! > nextState.content.length) {// Change > to >= to retrieve all results
                shortest.set(nextKey, nextState.content.length)
                q.push(nextState)
                q.sort(sorter) // Expensive but effective heap
            }
        }
        let result = "" // Change result to [] to retrieve all results
        while (q.length > 0) {
            const s = q.shift()!
            if (shortest.get(key(s))! > s.content.length) {
                continue
            } // shortes[s] === s.content.length from here
            if (result.length !== 0 && s.content.length !== result.length) { // Result has been found, and the latter result is not optimal result, clear heap
                break
            }
            if (s.index === data.length - 1) { // Reached end
                result = s.content
                continue // or just break here
            }
            if (s.isReference) {
                for (let index = s.index; index < data.length && index < s.index + 10; index++) {
                    heappush({
                        index,
                        isReference: false,
                        content: `${s.content}${index - s.index}${data.slice(s.index + 1, index + 1)}`
                    })
                }
            } else {
                for (const { len, pre } of [...findLongestCommon(s.index), { len: 0, pre: -1 }]) {
                    heappush({
                        index: s.index + len,
                        isReference: true,
                        content: `${s.content}${pre === -1 ? 0 : `${len}${pre}`}`,
                    })
                }
            }
        }
        return result
    },
    "Encryption I: Caesar Cipher": (contract) => {
        const parsed = contract.data as (string | number)[]
        const plaintext = parsed[0] as string, shift = parsed[1] as number
        const raw = Array.from({ length: 26 }, (_, i) => String.fromCharCode("A".charCodeAt(0) + i))
        const shifted = [...raw.slice((raw.length - shift) % 26), ...raw.slice(0, (raw.length - shift) % 26)]
        return [...plaintext].map(char => char === " " ? char : shifted[char.charCodeAt(0) - "A".charCodeAt(0)]).join("")
    },
    "Encryption II: Vigenère Cipher": (contract) => {
        const square = Array.from({ length: 26 }).map((_, rowBase) => Array.from({ length: 26 }).map((_, col) => String.fromCharCode((rowBase + col) % 26 + "A".charCodeAt(0))).join(""))
        const parsed = contract.data as string[]
        const plaintext = parsed[0] as string, keyword = parsed[1] as string
        return [...plaintext].map((text, i) => square[text.charCodeAt(0) - "A".charCodeAt(0)][keyword[i % keyword.length].charCodeAt(0) - "A".charCodeAt(0)]).join("")
    },
    "Square Root": () => {
        // TODO
        return null
        // Digit by digit method
        // const data = BigInt(contract.data as string)
        // return (data-1);
    },
}

// type ArrayLikeResult = string | number | ArrayLikeResult[];
// function findArray(text: string, firstOnly: boolean = true): ArrayLikeResult[] {
//     const has_subGroup = /^(.*?)\[(.*)\](.*?)$/
//     const format = (m: RegExpMatchArray) => {
//         return {
//             prefix: m[1],
//             subGroup: m[2],
//             suffix: m[3]
//         }
//     }
//     const matchedLines = text.split(/\n/)
//         .map(line => line.trim())
//         .map(line => line.match(has_subGroup))
//         .filter(m => m !== null).map(m => m[2])
//     if (matchedLines.length === 0) return []
//     const spliter = (text: string) => text.split(",")
//         .map(s => s.trim())
//         .filter(s => s.length > 0)
//         .map(s => s.match(/".*"/) ? s.slice(1, -1) : parseInt(s))
//         .filter(n => !Number.isNaN(n))
//     const extractRecusive = (text: string): ArrayLikeResult[] => {
//         const m = text.match(has_subGroup)
//         if (m) {
//             const groups = format(m)
//             return [...spliter(groups.prefix), extractRecusive(groups.subGroup), ...spliter(groups.suffix)]
//         }
//         return [...spliter(text)]
//     }
//     if (firstOnly) {
//         return extractRecusive(matchedLines[0])
//     }
//     return matchedLines.map(extractRecusive)
// }
