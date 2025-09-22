import type { NS } from "@ns"
import { ShareOn } from "../HackHelpers"
import { GrowMiner, HackMiner, Miners, WeakenMiner } from "../Miners/Miners"
import { FreeRam } from "/utils/ServerStat"
export type Handler = (ns: NS, host: string) => void
export const HostHandlers: Record<"KillallExceptHome" | "ShareOnHost", Handler> = {
    KillallExceptHome: (ns, host) => { if (host !== "home") ns.killall(host) },
    ShareOnHost: (ns, host) => ShareOn(ns, host)
}
export type TaskQueue = Promise<{ pid: number, host: string } | null>[]
export function ScheduleWeakenTask(ns: NS, servers: string[], target: string,
    preHandler: Handler = HostHandlers["KillallExceptHome"],
    postHandler: Handler = HostHandlers["ShareOnHost"]
): TaskQueue {
    let totalWeakened = 0
    const weakenUsage = ns.getScriptRam(Miners.WeakenMiner.scriptPath), weakenTime = ns.getWeakenTime(target)
    const maxSecurity = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target)
    return servers.map(host => (async () => {
        preHandler(ns, host)
        if (totalWeakened >= maxSecurity) {
            postHandler(ns, host)
            return null
        }
        const cores = ns.getServer(host).cpuCores
        const threadBoost = Math.ceil(
            Math.min(Math.floor(FreeRam.bind(ns)(host) / weakenUsage),
                Math.max(maxSecurity - totalWeakened, 0) / ns.weakenAnalyze(1, cores)))
        if (threadBoost === 0) {
            return null
        }
        // |=weaken 1======================================|
        const pid = new WeakenMiner(ns, host, target, threadBoost, 0).run()
        totalWeakened += ns.weakenAnalyze(threadBoost, cores)
        postHandler(ns, host)
        if (pid !== 0) {
            await new Promise((resolve) => setTimeout(resolve, weakenTime + 50))
            return { pid, host }
        } else {
            return null
        }
    })())
}
export function ScheduleHackTask(ns: NS, servers: string[], target: string,
    preHandler: Handler = HostHandlers["KillallExceptHome"],
    postHandler: Handler = HostHandlers["ShareOnHost"]
): TaskQueue {
    let scheduled = 0
    const hackTime = ns.getHackTime(target), growTime = ns.getGrowTime(target), weakenTime = ns.getWeakenTime(target)
    return servers.map(host => (async () => {
        preHandler(ns, host)
        let remainRam = FreeRam.bind(ns)(host), lastTaskPid = 0
        while (remainRam >= 0) {
            const threadBoost = FindMaxHGWThreads(ns, host, target, remainRam)
            if (threadBoost === null) break
            const { hThread, wThread1, gThread, wThread2, ram } = threadBoost
            remainRam -= ram
            const lagBase = (scheduled++) * 100
            const finishLines = {
                HackTime: lagBase + weakenTime - hackTime,
                weaken1Time: lagBase,
                growTime: lagBase + weakenTime - growTime,
                weaken2Time: lagBase
            }
            new HackMiner(ns, host, target, hThread, finishLines.HackTime).run()
            new WeakenMiner(ns, host, target, wThread1, finishLines.weaken1Time).run()
            new GrowMiner(ns, host, target, gThread, finishLines.growTime).run()
            lastTaskPid = new WeakenMiner(ns, host, target, wThread2, finishLines.weaken2Time).run()
        }
        postHandler(ns, host)
        if (lastTaskPid !== 0) {
            await new Promise((resolve) => setTimeout(resolve, weakenTime + scheduled * 100))
            return { pid: lastTaskPid, host }
        } else {
            return null
        }
    })())
}
export function ScheduleGrowTask(ns: NS, servers: string[], target: string,
    preHandler: Handler = HostHandlers["KillallExceptHome"],
    postHandler: Handler = HostHandlers["ShareOnHost"]
): TaskQueue {
    let scheduled = 0, totalGrowed = 1
    const growTime = ns.getGrowTime(target), weakenTime = ns.getWeakenTime(target), availableMoney = ns.getServerMoneyAvailable(target)
    return servers.map(host => (async () => {
        preHandler(ns, host)
        let remainRam = FreeRam.bind(ns)(host), lastTaskPid = 0
        while (remainRam >= 0) {
            const threadBoost = FindWGThreads(ns, host, target, remainRam),
                maxMoney = ns.getServerMaxMoney(target)
            if (threadBoost === null || totalGrowed >= (maxMoney / availableMoney)) {
                break
            }
            const { gThread, wThread, ram } = threadBoost
            remainRam -= ram
            const lagBase = (scheduled++) * 100
            const aligns = {
                weakenTime: lagBase,
                growTime: lagBase + weakenTime - 100 - growTime,
            }
            new GrowMiner(ns, host, target, gThread, aligns.growTime).run()
            lastTaskPid = new WeakenMiner(ns, host, target, wThread, aligns.weakenTime).run()
            try {
                totalGrowed *= ns.formulas.hacking.growPercent(ns.getServer(target), gThread, ns.getPlayer())
            }
            catch {
                totalGrowed *= 1 + GrowthPercent(ns, gThread, host, target)
            }
        }
        postHandler(ns, host)
        if (lastTaskPid !== 0) {
            await new Promise((resolve) => setTimeout(resolve, weakenTime + scheduled * 100))
            return { pid: lastTaskPid, host }
        } else {
            return null
        }
    })())
}
export function GrowthPercent(ns: NS, growThread: number, host: string, target: string) {
    const avai = ns.getServerMoneyAvailable(target), cores = ns.getServer(host).cpuCores
    if (avai === 0) {
        return 0
    }
    let l = 0, r = ns.getServerMaxMoney(target) / avai - 1
    let percent: number | undefined = undefined
    while (l <= r) {
        const mid = (l + r) / 2
        if (ns.growthAnalyze(target, 1 + mid, cores) <= growThread) {
            percent = mid
            l = mid + 0.00005
        } else {
            r = mid - 0.00005
        }
    }
    return percent ?? 0
}
export function Weaken1Thread(ns: NS, hackThread: number, cores: number) {
    return Math.ceil(ns.hackAnalyzeSecurity(hackThread) / ns.weakenAnalyze(1, cores))
}
export function Weaken2Thread(ns: NS, growThread: number) {
    // cores are devided
    // and u should not provide target parameter to growthAnalyze if the hypotential status doesn't match,
    // the secutiry increased is always 0 at maxMoney
    // return Math.ceil(ns.growthAnalyzeSecurity(growThread, target, cores) / ns.weakenAnalyze(1, cores))
    return Math.ceil(ns.growthAnalyzeSecurity(growThread) / ns.weakenAnalyze(1))
}
export function GrowThread(ns: NS, hackThread: number, target: string, cores: number) {
    const hackPercent = ns.hackAnalyze(target) * hackThread
    return Math.ceil(ns.growthAnalyze(target, 1 / (1 - hackPercent), cores))
}
export function FindMaxHGWThreads(ns: NS, host: string, target: string, freeRam: number) {// Hack Weaken Grow Weaken
    const hackUsage = ns.getScriptRam(Miners.HackMiner.scriptPath),
        weakenUsage = ns.getScriptRam(Miners.WeakenMiner.scriptPath),
        growUsage = ns.getScriptRam(Miners.GrowMiner.scriptPath),
        cores = ns.getServer(host).cpuCores
    let l = 1, r = Math.floor(Math.min(freeRam / hackUsage, 0.99 / ns.hackAnalyze(target)))
    let optimal: { hThread: number, wThread1: number, gThread: number, wThread2: number, ram: number } | undefined = undefined
    // Binary search
    while (l <= r) {
        const mid = Math.floor((l + r) / 2)
        const gThread = GrowThread(ns, mid, target, cores), wThread1 = Weaken1Thread(ns, mid, cores), wThread2 = Weaken2Thread(ns, gThread)
        const ram = (wThread1 + wThread2) * weakenUsage + hackUsage * mid + growUsage * gThread
        if (ram <= FreeRam.bind(ns)(host)) {
            optimal = { hThread: mid, wThread1, gThread, wThread2, ram: ram }
            l = mid + 1
        } else {
            r = mid - 1
        }
    }
    return optimal ?? null
}
export function FindWGThreads(ns: NS, host: string, target: string, freeRam: number) { // Weaken Grow
    const weakenUsage = ns.getScriptRam(Miners.WeakenMiner.scriptPath),
        growUsage = ns.getScriptRam(Miners.GrowMiner.scriptPath),
        cores = ns.getServer(host).cpuCores
    const avai = ns.getServerMoneyAvailable(target), max = ns.getServerMaxMoney(target)
    let l = 1, r = Math.min(Math.floor(freeRam / growUsage), Math.ceil(ns.growthAnalyze(target, max / (avai ?? max), cores)))
    let optimal: { gThread: number, wThread: number, ram: number } | undefined = undefined
    // Binary search
    while (l <= r) {
        const mid = Math.floor((l + r) / 2)
        const wThread = Weaken2Thread(ns, mid)
        const ram = Weaken2Thread(ns, mid) * weakenUsage + growUsage * mid
        if (ram <= freeRam) {
            optimal = { gThread: mid, wThread, ram }
            l = mid + 1
        } else {
            r = mid - 1
        }
    }
    return optimal ?? null
}
