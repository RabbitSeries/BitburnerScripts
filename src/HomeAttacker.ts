import { NS } from "@ns";
import { SingleTaskMinerPath } from "./Hack/SingleTaskMiner";

export async function main(ns: NS) {
    ns.exec(SingleTaskMinerPath, "home", Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) / ns.getScriptRam(SingleTaskMinerPath) / 2), 'home', ns.args[0], ns.args[1]);
    ns.exec(SingleTaskMinerPath, "home", Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) / ns.getScriptRam(SingleTaskMinerPath)), 'home', ns.args[0], 1);//weaken
}