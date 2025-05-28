import { NS, ScriptArg } from "@ns"
import { IMiner } from "./IMiner";

export function ScanAllServers(ns: NS) {
    const visited = new Set<string>();
    const queue = ["home"];
    visited.add("home");
    const BFSSorted = ["home"];
    while (queue.length > 0) {
        const current = queue.shift()!;
        for (const neighbor of ns.scan(current)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
                BFSSorted.push(neighbor);
            }
        }
    }
    return {
        sorted: BFSSorted,
        valueset: visited
    };
}

export function TryNuke(ns: NS, target: string) {
    if (!ns.hasRootAccess(target)) {
        try {
            try {
                ns.brutessh(target);
            } catch { }
            try {
                ns.ftpcrack(target);
            } catch { }
            try {
                ns.httpworm(target);
            } catch { }
            try {
                ns.sqlinject(target);
            } catch { }
            ns.nuke(target);
        } catch {
            return ns.hasRootAccess(target);
        }
    }
    return ns.hasRootAccess(target);
}


export function TryHacking(ns: NS, miner: IMiner, ...args: ScriptArg[]): number {
    const scriptPath = miner.args.scriptPath, currentHost = miner.args.hostName, target = miner.args.targetName, threadOptions = miner.args.threadOrOptions;
    let status = 0;
    try {
        ns.killall(currentHost);
        Scp(ns, currentHost);
        status = ns.exec(scriptPath, currentHost, threadOptions, ...args);
    } catch (e) {
        ns.print(`ERROR: Fatal error: ${e instanceof Error ? e.message : String(e)}`);
    }
    if (status) {
        ns.tprint(`SUCCESS: running ${scriptPath} on ${currentHost} hacking ${target} with threadOptions: ${threadOptions}`);
    } else {
        ns.tprint(`FAILED: running ${scriptPath} on ${currentHost} hacking ${target} with threadOptions: ${threadOptions}`);
    }
    return status;
}


function Scp(ns: NS, destination: string): boolean {
    return ns.scp(ns.ls("home").filter((path) => path.endsWith(".js")), destination);
}
