import type { NS } from "@ns"
export function CurrMoneyRate(this: NS, host: string) {
    return this.getHackingMultipliers().money * this.getServerMoneyAvailable(host) / (this.getHackTime(host) / 1000)
}
export function PotentialMoneyRate(this: NS, host: string) {
    return this.getHackingMultipliers().money * this.getServerMaxMoney(host) / (this.getHackTime(host) / 1000) / (100 + this.getServerSecurityLevel(host)) * (100 + this.getServerMinSecurityLevel(host))
}
export function FreeRam(this: NS, host: string) {
    return this.getServerMaxRam(host) - this.getServerUsedRam(host)
}