import { NS } from '@ns'
import { cyanStr } from 'Console/ConsoleColor';
import { RegularMiner, RegularMinerPath } from './Hack/RegularMiner';
export async function main(ns: NS) {
    if (ns.args.length !== 1 || typeof ns.args[0] !== "string") {
        ns.tprint(`Target is not specified, exiting.`);
        ns.exit();
    }
    const target = ns.args[0];
    const q = ["home"];
    const visited = new Set(["home"]);
    while (q.length > 0) {
        const currentHost = q.shift();
        if (currentHost !== "home") {
            TryNuke(ns, currentHost);
            if (ns.hasRootAccess(currentHost)) {
                TryHacking(ns, currentHost, target);
            } else {
                const m = ns.getScriptRam(RegularMinerPath),
                    U = ns.getServerUsedRam(currentHost),
                    M = ns.getServerMaxRam(currentHost),
                    R = M - U;
                ns.tprint(`WARN:\t Failed to run scipt on traget ${cyanStr(currentHost)}, skipping`)
                ns.tprint(`INFO:\t\t Has Root Access: ${ns.hasRootAccess(currentHost)}`);
                ns.tprint(`INFO:\t\t Required mem usage: ${m}(Ram)/${U}(Used)/${M}(Max)/${R}(Remain)/`);
                ns.tprint(`INFO:\t\t Required hack level: ${ns.getHackingLevel()}/${ns.getServerRequiredHackingLevel(currentHost)}`)
                ns.tprint(`INFO:\t\t Required open ports: ${ns.getServerNumPortsRequired(currentHost)}`);
            }
        }
        for (const neighbor of ns.scan(currentHost)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                q.push(neighbor);
            }
        }
    }
}

function TryHacking(ns: NS, currentHost: string, target: string) {
    const miner: RegularMiner = new RegularMiner(ns, {
        hostname: currentHost,
        targetname: target,
        threadOrOptions: Math.floor(ns.getServerMaxRam(currentHost) / ns.getScriptRam(RegularMinerPath))
    });
    if (!ns.scp(miner.HierachyPaths, currentHost)) {
        ns.tprint(`Failed Scp ${miner.HierachyPaths} to ${currentHost}`)
        return
    }
    try {
        if (miner.getMaxThread() > 0) {
            ns.killall(currentHost);
            if (target !== null) {
                if (miner.exec()) {
                    ns.tprint(`SUCCESS: running ${miner.ScriptPath} on ${currentHost} hacking ${target} in ${miner.getMaxThread()} threads)`);
                } else {
                    ns.tprint(`FAILED: running ${miner.ScriptPath} on ${currentHost} hacking ${target} in ${miner.getMaxThread()} threads)`);
                }
            }
        }
    } catch (e) {
        ns.tprint(`ERROR: Fatal error: ${e instanceof Error ? e.message : String(e)}`);
    }
}

function TryNuke(ns: NS, target: string) {
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