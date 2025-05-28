import { NS } from "@ns";
import { SingleTaskMinerPath } from "./Hack/SingleTaskMiner";

export async function main(ns: NS) {
    if (ns.getServerMoneyAvailable(ns.args[0].toString()) / ns.getServerMaxMoney(ns.args[0].toString()) > 0.8) {
        ns.exec(SingleTaskMinerPath, "home", Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) / ns.getScriptRam(SingleTaskMinerPath) / 2), 'home', ns.args[0], 0);//hack
    } else {
        ns.exec(SingleTaskMinerPath, "home", Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) / ns.getScriptRam(SingleTaskMinerPath) / 2), 'home', ns.args[0], 2);//grow
    }
    ns.exec(SingleTaskMinerPath, "home", Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) / ns.getScriptRam(SingleTaskMinerPath)), 'home', ns.args[0], 1);//weaken
}