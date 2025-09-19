import type { NS } from "@ns"
export function CurrMoneyRate(ns: NS, host: string) {
    return ns.getHackingMultipliers().money * ns.getServerMoneyAvailable(host) / (ns.getHackTime(host) / 1000)
}
export function PotentialMoneyRate(ns: NS, host: string) {
    return ns.getHackingMultipliers().money * ns.getServerMaxMoney(host) / (ns.getHackTime(host) / 1000) / (100 + ns.getServerSecurityLevel(host)) * (100 + ns.getServerMinSecurityLevel(host))
}
