import type { NS } from "@ns"
import { ScanAllServers } from "../HackHelpers"
import { LoopUntillMax, SmartDistributor } from "../Distributors"
export async function main(ns: NS) {
    ns.disableLog("ALL")
    const target = ns.args[0].toString()
    const servers = ScanAllServers(ns).sorted
    await LoopUntillMax(ns, servers, target)
    await SmartDistributor(ns, servers, target)
}