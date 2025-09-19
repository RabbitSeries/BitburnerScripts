import type { NS } from  "@ns"
import { Paths } from "/Hack/Miners"
const { SingleTaskMinerPath } = Paths
export async function main(ns: NS) {
    const unit = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) / ns.getScriptRam(SingleTaskMinerPath) / 10)
    ns.exec(SingleTaskMinerPath, "home", unit * 2, 'home', ns.args[0], 0)
    ns.exec(SingleTaskMinerPath, "home", unit * 5, 'home', ns.args[0], 1)
    ns.exec(SingleTaskMinerPath, "home", unit * 3, 'home', ns.args[0], 3)
}