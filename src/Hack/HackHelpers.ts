import type { NS, ScriptArg } from "@ns"
import type { IMiner } from "./IMiner"

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
    } catch { }
    try {
        ns.ftpcrack(target)
    } catch { }
    try {
        ns.httpworm(target)
    } catch { }
    try {
        ns.sqlinject(target)
    } catch { }
    try {
        ns.nuke(target)
    } catch { }
    return ns.hasRootAccess(target)
}


export function TryHacking(ns: NS, miner: IMiner, ...args: ScriptArg[]): number {
    const scriptPath = miner.scriptPath, currentHost = miner.args.hostName, target = miner.args.targetName, threadOptions = miner.args.threadOrOptions
    let status = 0
    try {
        ns.killall(currentHost)
        Scp(ns, currentHost)
        status = ns.exec(scriptPath, currentHost, threadOptions, ...args)
    } catch (e) {
        ns.print(`ERROR: Fatal error: ${e instanceof Error ? e.message : String(e)}`)
    }
    if (status) {
        ns.print(`SUCCESS: running ${scriptPath} on ${currentHost} hacking ${target} with threadOptions: ${threadOptions}`)
    } else {
        ns.print(`FAILED: running ${scriptPath} on ${currentHost} hacking ${target} with threadOptions: ${threadOptions}`)
    }
    return status
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

function Scp(ns: NS, destination: string): boolean {
    return ns.scp(ns.ls("home").filter((path) => path.endsWith(".js")), destination)
}
