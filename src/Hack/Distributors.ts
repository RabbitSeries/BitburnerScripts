import type { NS } from "@ns"
import { ShareOn } from "./HackHelpers"
import { Miners, WeakenMiner, GrowMiner, HackMiner } from "./Miners"
import { FreeRam } from "/utils/ServerStat"
const prefix = "Hack/Scripts/"
export const Distributors = {
    SmartDistributor: {
        scriptPath: prefix + "SmartDistributor.js"
    }
}
export class SmartDistributor extends HackMiner {
    scriptPath = Distributors.SmartDistributor.scriptPath
    constructor(ns: NS, targetName: string) {
        super(ns, "home", targetName, 1)
    }
}
export async function BeginSmartDistributor(ns: NS, servers: string[], target: string) {
    const shareOn = async (host: string, time?: number) => ShareOn(ns, host, time)
    while (true) {
        const condition = ns.getServerMaxMoney(target) * 0.95 >= ns.getServerMoneyAvailable(target)
        const hackUsage = ns.getScriptRam(Miners.HackMiner.scriptPath),
            weakenUsage = ns.getScriptRam(Miners.WeakenMiner.scriptPath),
            growUsage = ns.getScriptRam(Miners.GrowMiner.scriptPath)
        const { speed } = ns.getHackingMultipliers()
        const hackTime = ns.getHackTime(target) / speed,
            growTime = ns.getGrowTime(target) / speed,
            weakenTime = ns.getWeakenTime(target) / speed
        // ToDo, after I have 5b, I may make use of formula api
        const taskq: Promise<void>[] = []
        for (const host of servers.filter(s => ns.hasRootAccess(s) && ns.getServerMaxRam(s) > 0)) {
            taskq.push((async () => {
                if (host !== "home") {
                    ns.killall(host)
                }
                if (condition) {
                    const usage = weakenUsage * 2 + growUsage + hackUsage
                    const threadBoost = Math.floor(FreeRam.bind(ns)(host) / usage)
                    if (threadBoost === 0) {
                        await shareOn(host)
                        return
                    }
                    //                    |= hack ====================|
                    // |=weaken 1======================================|
                    //                |= grow ==========================|
                    //   |=weaken 2======================================|
                    new WeakenMiner(ns, host, target, threadBoost).run()
                    await new Promise((resolve) => setTimeout(() => resolve(true), 200))
                    new WeakenMiner(ns, host, target, threadBoost).run()
                    await shareOn(host, weakenTime - 100 - growTime)
                    new GrowMiner(ns, host, target, threadBoost).run()
                    await shareOn(host, growTime - 200 - hackTime)
                    new HackMiner(ns, host, target, threadBoost).run()
                    await shareOn(host, hackTime + 400)
                } else {
                    const usage = weakenUsage + growUsage
                    const threadBoost = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / usage)
                    if (threadBoost === 0) {
                        await shareOn(host)
                        return
                    }
                    //                |= grow ========================|
                    // |=weaken 1======================================|
                    new WeakenMiner(ns, host, target, threadBoost).run()
                    await shareOn(host, weakenTime - 100 - growTime)
                    new GrowMiner(ns, host, target, threadBoost).run()
                    await shareOn(host, growTime - 200)
                }
            })())
        }
        ns.print("Done distributing")
        while (taskq.length > 0) {
            await taskq.shift()
        }
        ns.print("Task queue is empty, continue to next round")
    }
}