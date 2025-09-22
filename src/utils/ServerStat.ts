import type { NS } from "@ns"
export function CurrMoneyRate(this: NS, host: string) {
    return this.getServerMoneyAvailable(host) / (this.getWeakenTime(host) / 1000)
}
export function PotentialMoneyRate(this: NS, host: string) {
    return this.getServerMaxMoney(host)/* *playermul*hacknodemul*（1-required/playerskill）/240*/ / (this.getWeakenTime(host) / 1000) / (100 - this.getServerSecurityLevel(host)) * (100 - this.getServerMinSecurityLevel(host))
}
export function FreeRam(this: NS, host: string) {
    return this.getServerMaxRam(host) - this.getServerUsedRam(host)
}