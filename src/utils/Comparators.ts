import type { NS } from "@ns"
import { CurrMoneyRate, PotentialMoneyRate } from "./ServerStat"
type Sorter = (a: string, b: string) => number
export class Comparator {
    public static sortBy(sorter: Sorter): Comparator {
        return new Comparator([], sorter)
    }
    public compare: Sorter = (a, b) => {
        for (const sorter of this.sortChain) {
            const cmp = sorter(a, b)
            if (cmp !== 0) {
                return cmp
            }
        }
        return this.currentSorter(a, b)
    }
    public thenSortBy(sorter: Sorter): Comparator {
        return new Comparator([...this.sortChain, this.currentSorter], sorter)
    }
    public reversed(): Comparator {
        return new Comparator([...this.sortChain], (a, b) => {
            return -1 * this.currentSorter(a, b)
        })
    }
    private constructor(chain: Sorter[], sorter: Sorter) {
        this.sortChain = [...chain]
        this.currentSorter = sorter
    }
    private sortChain: Sorter[]
    private currentSorter: Sorter
}
export function RootAccessRank(this: NS, a: string, b: string) {
    return (+ this.hasRootAccess(b)) - (+ this.hasRootAccess(a))
}
export function CurrentMoneyRank(this: NS, a: string, b: string) {
    return CurrMoneyRate(this, b) - CurrMoneyRate(this, a)
}
export function PotentialMoneyRank(this: NS, a: string, b: string) {
    return PotentialMoneyRate(this, b) - PotentialMoneyRate(this, a)
}