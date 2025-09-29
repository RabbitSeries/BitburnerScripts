import type { CodingContractName, CodingContractObject, NS } from "@ns"
// import { ScanAllServers } from "/Hack/HackHelpers"
// Don't import {type NS} from "@ns"
// instead import type {NS} from "@ns"
export async function main(ns: NS) {
    const filename = ns.codingcontract.createDummyContract("Encryption I: Caesar Cipher")
    await TellContract(ns, "home", [filename])
    ns.rm(filename, "home")
    // for (const host of ScanAllServers(ns).sorted) {
    //     const contracts = ns.ls(host, ".cct")
    //     if (contracts.length > 0) {
    //         ns.tprint("Found on ", host, ": ", ...contracts)
    //         await TellContract(ns, host, contracts)
    //     }
    // }
}

export async function TellContract(ns: NS, host: string, files: string[]) {
    for (const file of files) {
        const contract = ns.codingcontract.getContract(file, host)
        try {
            await ns.prompt(contract.type + "\n" + contract.description)
            const result = ContractSolves[contract.type](contract)
            if (result !== null) {
                const confirm = await ns.prompt(result)
                if (result.length > 0 && typeof confirm === "boolean" && confirm) {
                    await ns.prompt(contract.submit(result))
                    await ns.prompt(`${contract.numTriesRemaining()}`)
                }
            }
        } catch (e) { ns.tprint(e) }
    }
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
    "Total Ways to Sum II": () => null,
    "Spiralize Matrix": () => null,
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
    "Compression I: RLE Compression": () => null,
    "Compression II: LZ Decompression": () => null,
    "Compression III: LZ Compression": () => null,
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
    "Square Root": () => null,
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
