import type { NS } from "@ns"
import { CurrMoneyRate, PotentialMoneyRate } from "./ServerStat"
export type Sorter = (a: string, b: string) => number
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
type nsSorter = (this: NS, a: string, b: string) => number;
export const RootAccessRank: nsSorter = function (this, a, b) {
    return (+ this.hasRootAccess(b)) - (+ this.hasRootAccess(a))
}
export const MaxMoneyRank: nsSorter = function (this, a, b) {
    return this.getServerMaxMoney(b) - this.getServerMaxMoney(a)
}
export const CurrentMoneyRateRank: nsSorter = function (this, a, b) {
    return CurrMoneyRate(this, b) - CurrMoneyRate(this, a)
}
export const PotentialMoneyRank: nsSorter = function (this: NS, a: string, b: string) {
    return PotentialMoneyRate(this, b) - PotentialMoneyRate(this, a)
}
export const HackLevelRank: nsSorter = function (this: NS, a: string, b: string) {
    return this.getServerRequiredHackingLevel(a) - this.getServerRequiredHackingLevel(b)
}
export const HackTimeRank: nsSorter = function (this, a, b) {
    return this.getHackTime(a) - this.getHackTime(b)
}
export const SecurityLevelRank: nsSorter = function (this, a, b) {
    return this.getServerSecurityLevel(a) - this.getServerSecurityLevel(b)
}