import { NS } from '@ns'
import { cyanStr } from 'Console/ConsoleColor';
import { RegularMiner, RegularMinerPath } from './Hack/RegularMiner';
import { SingleTaskMiner, SingleTaskMinerPath } from './Hack/SingleTaskMiner';
import * as HackHelpers from './Hack/HackHelpers';
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
    const hosts = HackHelpers.ScanAllServers(ns);
    if (!hosts.valueset.has(args.target)) {
        ns.tprint(`ERROR: unkown target: ${args.target}`);
        ns.exit();
    }
    const ScriptPath = args.miner === "RegularMiner" ? RegularMinerPath : SingleTaskMinerPath;
    const target = args.target;
    // const Tasks = [0, 1, 2, 1];//hack, weaken, grow, weaken
    const Tasks = [2, 2, 2, 1, 1, 1, 0, 0];//grow, grow, grow, hack, hack, hack, weaken, weaken
    let curTaskId = 0;
    const m = ns.getScriptRam(ScriptPath);
    for (const currentHost of hosts.sorted) {
        const U = ns.getServerUsedRam(currentHost),
            M = ns.getServerMaxRam(currentHost),
            R = M - U;
        const MaxThreads = Math.floor(M / m), MaxShareThread = Math.floor(M / ns.getScriptRam("MemSharer.js"));
        if (currentHost === "home") {
            continue;
        }
        if (!HackHelpers.TryNuke(ns, currentHost) || (MaxThreads === 0 && MaxShareThread === 0)) {
            ns.tprint(`WARN:\t Failed to run scipt on traget ${cyanStr(currentHost)}, skipping`)
            ns.print(`WARN:\t Failed to run scipt on traget ${cyanStr(currentHost)}, skipping`)
            ns.print(`INFO:\t\t Has Root Access: ${ns.hasRootAccess(currentHost)}`);
            ns.print(`INFO:\t\t Required mem usage: ${m}(Ram)/${U}(Used)/${M}(Max)/${R}(Remain)/`);
            ns.print(`INFO:\t\t Required hack level: ${ns.getHackingLevel()}/${ns.getServerRequiredHackingLevel(currentHost)}`)
            ns.print(`INFO:\t\t Required open ports: ${ns.getServerNumPortsRequired(currentHost)}`);
            continue;
        }
        const miner: IMiner | null = MaxThreads > 0 ? (args.miner === "RegularMiner" ?
            new RegularMiner(ns, {
                hostName: currentHost,
                targetName: target,
                scriptPath: RegularMinerPath,
                threadOrOptions: Math.floor(M / m)
            }) :
            new SingleTaskMiner(ns, {
                hostName: currentHost,
                targetName: target,
                scriptPath: SingleTaskMinerPath,
                threadOrOptions: Math.floor(M / m),
                task: Tasks[curTaskId]
            })) : null;
        if (miner)
            miner.run();
        const shareT = Math.floor((ns.getServerMaxRam(currentHost) - ns.getServerUsedRam(currentHost)) / ns.getScriptRam("MemSharer.js"));
        if (shareT > 0) {
            ns.exec("MemSharer.js", currentHost, shareT);
        }
        if (MaxThreads > 0 && args.miner === "SingleTaskMiner") {
            curTaskId = (curTaskId + 1) % Tasks.length;
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
