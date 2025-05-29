import { NS } from '@ns'
import { cyanStr } from 'Console/ConsoleColor';
import { RegularMiner, RegularMinerPath } from './Hack/RegularMiner';
import { SingleTaskMiner, SingleTaskPath } from './Hack/SingleTaskMiner';
import scanAllServers from './Hack/Scanner';
import { IMiner } from './Hack/IMiner';
class DistributorArgs {
    miner: string | null = null;
    target: string | null = null;
}

const Miners = new Set(["RegularMiner", "SingleTaskMiner"]);

export async function main(ns: NS) {
    const args = parseArgs(ns);
    if (args === null || args.miner === null || args.target === null) {
        ns.tprint(`ERROR unable to parse args`)
        ns.exit();
    }
    ns.tprint(`INFO: Parsed args: {miner: ${args.miner}, traget: ${args.target}}`)
    if (!Miners.has(args.miner)) {
        ns.tprint(`ERROR: Unsupported miner: ${args.miner}`);
        ns.exit();
    }
    const hosts = scanAllServers(ns);
    if (!hosts.valueset.has(args.target)) {
        ns.tprint(`ERROR: unkown target: ${args.target}`);
        ns.exit();
    }
    const ScriptPath = args.miner === "RegularMiner" ? RegularMinerPath : SingleTaskPath;
    const target = args.target;
    const Tasks = [0, 1, 2, 1];//hack, weaken, grow, weaken
    let curTaskId = 0;
    for (const currentHost of hosts.sorted) {
        const m = ns.getScriptRam(ScriptPath),
            U = ns.getServerUsedRam(currentHost),
            M = ns.getServerMaxRam(currentHost),
            R = M - U;
        if (currentHost !== "home") {
            TryNuke(ns, currentHost);
            if (ns.hasRootAccess(currentHost)) {
                const miner = args.miner === "RegularMiner" ?
                    new RegularMiner(ns, {
                        hostname: currentHost,
                        targetname: target,
                        threadOrOptions: Math.floor(M / m)
                    }) :
                    new SingleTaskMiner(ns, {
                        hostname: currentHost,
                        targetname: target,
                        threadOrOptions: Math.floor(M / m),
                        task: Tasks[curTaskId]
                    });
                TryHacking(ns, miner);
                curTaskId = (curTaskId + 1) % 4;
            } else {
                ns.tprint(`WARN:\t Failed to run scipt on traget ${cyanStr(currentHost)}, skipping`)
                ns.tprint(`INFO:\t\t Has Root Access: ${ns.hasRootAccess(currentHost)}`);
                ns.tprint(`INFO:\t\t Required mem usage: ${m}(Ram)/${U}(Used)/${M}(Max)/${R}(Remain)/`);
                ns.tprint(`INFO:\t\t Required hack level: ${ns.getHackingLevel()}/${ns.getServerRequiredHackingLevel(currentHost)}`)
                ns.tprint(`INFO:\t\t Required open ports: ${ns.getServerNumPortsRequired(currentHost)}`);
            }
        }
    }
}


function printHelp(ns: NS) {
    ns.tprint(cyanStr(`Usage:\n\
        ./BFSDistributor.js\n\
            --miner=<miner>,  --miner <miner>\n\
            --target=<target>, --target <target>\n\
        `))
    ns.tprint("Supported minders:");
    for (const miner of Miners) {
        ns.tprint(cyanStr(`\t${miner}`));
    }
}

function parseArgs(ns: NS): DistributorArgs | null {
    if (ns.args.length == 0) {
        ns.tprint("Empty args");
        printHelp(ns);
        return null;
    }
    const args = ns.args.map(e => e.toString());
    const res: DistributorArgs = { miner: null, target: null };
    let argId = 0;
    while (argId < args.length) {
        const arg = args[argId];
        if (!arg.startsWith("--")) {
            ns.tprint(`Unrecongnized argument: ${arg}`);
            printHelp(ns);
            break;
        }
        const argName = arg.indexOf("=") !== -1 ? arg.substring(2, arg.indexOf("=")) : arg.substring(2);
        if (argName.length === 0 || !(argName in res)) {// in can only be used with an object instance
            ns.tprint(`Unrecongnized argument: ${arg}, argname: ${!argName.length ? "null" : argName}`);
            printHelp(ns);
            break;
        }
        if (argName === "miner") {
            res.miner = arg.indexOf("=") !== -1 ? arg.substring(arg.indexOf("=") + 1) : args[argId + 1];
        } else if (argName === "target") {
            res.target = arg.indexOf("=") !== -1 ? arg.substring(arg.indexOf("=") + 1) : args[argId + 1];
        }
        if (arg.indexOf("=") === -1)
            argId++;  // discontinuous option --option value, skip one more
        argId++;
    }
    return res;
}

function TryHacking(ns: NS, miner: IMiner) {
    const currentHost = miner.Args.hostname, target = miner.Args.targetname;
    if (!ns.scp(miner.HierachyPaths, currentHost)) {
        ns.tprint(`Failed Scp ${miner.HierachyPaths} to ${currentHost}`)
        return
    }
    try {
        ns.killall(currentHost);
        if (target !== null) {
            if (miner.exec()) {
                ns.tprint(`SUCCESS: running ${miner.ScriptPath} on ${currentHost} hacking ${target})`);
            } else {
                ns.tprint(`FAILED: running ${miner.ScriptPath} on ${currentHost} hacking ${target} )`);
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