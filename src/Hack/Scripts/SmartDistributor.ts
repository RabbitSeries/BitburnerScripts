import type { NS } from "@ns"
import { ScanAllServers } from "../HackHelpers"
import { BeginSmartDistributor } from "../Distributors"
export async function main(ns: NS) {
    ns.disableLog("ALL")
    const target = ns.args[0].toString()
    const servers = ScanAllServers(ns).sorted
    await BeginSmartDistributor(ns, servers, target)
}