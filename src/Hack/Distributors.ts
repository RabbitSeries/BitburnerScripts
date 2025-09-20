import type { NS } from "@ns"
import { ShareOn } from "./HackHelpers"
import { Miners, WeakenMiner, GrowMiner, HackMiner } from "./Miners"
const prefix = "Hack/Scripts/"
export const Distributors = {
    SmartDistributor: {
        scriptPath: prefix + "SmartDistributor.js"
    }
}
export async function LoopUntillMax(ns: NS, servers: string[], target: string) {
    const shareOn = async (host: string, time?: number) => ShareOn(ns, host, time)
    while (ns.getServerMaxMoney(target) != ns.getServerMoneyAvailable(target)) {
        const hackUsage = ns.getScriptRam(Miners.HackMiner.scriptPath),
            weakenUsage = ns.getScriptRam(Miners.WeakenMiner.scriptPath),
            growUsage = ns.getScriptRam(Miners.GrowMiner.scriptPath)
        const usage = weakenUsage * 2 + growUsage + hackUsage
        const { speed } = ns.getHackingMultipliers()
        const growTime = ns.getGrowTime(target) / speed,
            weakenTime = ns.getWeakenTime(target) / speed
        const taskq: Promise<void>[] = []
        for (const host of servers.filter(s => ns.hasRootAccess(s) && ns.getServerMaxRam(s) > 0)) {
            taskq.push((async () => {
                if (host !== "home") {
                    ns.killall(host)
                }
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
            })())
        }
    }
}
export async function SmartDistributor(ns: NS, servers: string[], target: string) {
    const shareOn = async (host: string, time?: number) => ShareOn(ns, host, time)
    while (true) {
        const hackUsage = ns.getScriptRam(Miners.HackMiner.scriptPath),
            weakenUsage = ns.getScriptRam(Miners.WeakenMiner.scriptPath),
            growUsage = ns.getScriptRam(Miners.GrowMiner.scriptPath)
        const usage = weakenUsage * 2 + growUsage + hackUsage
        const { speed } = ns.getHackingMultipliers()
        const hackTime = ns.getHackTime(target) / speed,
            growTime = ns.getGrowTime(target) / speed,
            weakenTime = ns.getWeakenTime(target) / speed
        const taskq: Promise<void>[] = []
        for (const host of servers.filter(s => ns.hasRootAccess(s) && ns.getServerMaxRam(s) > 0)) {
            taskq.push((async () => {
                if (host !== "home") {
                    ns.killall(host)
                }
                const threadBoost = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / usage)
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
                return
            })())
        }
        ns.print("Done distributing")
        while (taskq.length > 0) {
            await taskq.shift()
        }
        ns.print("Task queue is empty, continue to next round")
    }
}