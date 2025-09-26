import type { NS, ScriptArg } from "@ns"
import type { IMiner } from "./Miners/IMiner"
import { MemSharer, Miners } from "./Miners/Miners"
import { FreeRam } from "/utils/ServerStat"
export function ScanAllServers(ns: NS) {
    const visited = new Set<string>()
    const queue = ["home"]
    const BFSSorted = []
    while (queue.length > 0) {
        const current = queue.shift()!
        for (const neighbor of ns.scan(current)) {
            if (neighbor !== "home" && !visited.has(neighbor)) {
                visited.add(neighbor)
                queue.push(neighbor)
                BFSSorted.push(neighbor)
            }
        }
    }
    return {
        sorted: BFSSorted,
        valueset: visited
    }
}

export function TryNuke(ns: NS, target: string) {
    if (ns.hasRootAccess(target)) {
        return true
    }
    try {
        ns.brutessh(target)
    } catch {/*  */ }
    try {
        ns.ftpcrack(target)
    } catch { /*  */ }
    try {
        ns.relaysmtp(target)
    } catch {/*  */ }
    try {
        ns.httpworm(target)
    } catch {/*  */ }
    try {
        ns.sqlinject(target)
    } catch {/*  */ }
    // Keep nuke at last
    try {
        ns.nuke(target)
    } catch { /*  */ }
    return ns.hasRootAccess(target)
}

export enum HackTask {
    Hack,
    Weaken,
    Grow
}

export function TryHacking(ns: NS, miner: IMiner, ...args: ScriptArg[]): number {
    const scriptPath = miner.scriptPath, currentHost = miner.args.hostName, target = miner.args.targetName, threadOptions = miner.threadOptions
    if (typeof threadOptions === "number" && threadOptions === 0) {
        return 0
    }
    try {
        Scp(ns, miner.args.hostName)
        const result = ns.exec(scriptPath, currentHost, threadOptions, ...args)
        // ns.print(`SUCCESS: running ${scriptPath} on ${currentHost} hacking ${target} with threadOptions: ${threadOptions} at ${result}`)
        if (result === 0) {
            throw new Error(["Runing", scriptPath, "at", currentHost, "with ram", FreeRam.bind(ns)(currentHost), "/", +threadOptions * ns.getScriptRam(scriptPath)].join(" "))
        }
        return result;
    } catch (e) {
        ns.print(`ERROR: Fatal error: ${e instanceof Error ? e.message : String(e)}`)
        ns.print(`FAILED: running ${scriptPath} on ${currentHost} hacking ${target} with threadOptions: ${threadOptions}`)
        return 0
    }
}

export function FindPathTo(ns: NS, target: string): string[] | null {
    const visited = new Set(['home'])
    type Step = {
        host: string
        path: string[]
    }
    const q: Step[] = [{
        host: 'home',
        path: []
    }]
    while (q.length > 0) {
        const { host, path } = q.shift()!
        if (host === target) {
            return path
        }
        for (const neighbor of ns.scan(host)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor)
                q.push({
                    host: neighbor,
                    path: [...path, neighbor]
                })
            }
        }
    }
    return null
}

export function Scp(ns: NS, destination: string): boolean {
    return ns.scp(ns.ls("home").filter(path => path.endsWith(".js")), destination)
}

export const ShareOn = (ns: NS, host: string, time?: number): Promise<void> => {
    return new Promise((resolve) => {
        ns.scriptKill(Miners.MemSharer.scriptPath, host)
        new MemSharer(ns, host, Math.floor(FreeRam.bind(ns)(host) / ns.getScriptRam(Miners.MemSharer.scriptPath))).run()
        if (time !== undefined) {
            setTimeout(() => {
                ns.scriptKill(Miners.MemSharer.scriptPath, host)
                resolve()
            }, time)
        } else {
            resolve()
        }
    })
}
