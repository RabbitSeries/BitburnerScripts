import { NS, RunOptions } from "@ns";
import { IMiner, IMinerArgs } from "./IMiner";
import { ConsoleColorPath, cyanStr } from "../Console/ConsoleColor";
import * as HackHelpers from "./HackHelpers";

export class RegularMinerArgs implements IMinerArgs {
    hostName: string = "";
    targetName: string = "";
    scriptPath: string = "";
    threadOrOptions?: number | RunOptions;
}

export const RegularMinerPath = 'Hack/RegularMiner.js'

export class RegularMiner implements IMiner {
    ns: NS;
    args: RegularMinerArgs;
    ScriptPath = RegularMinerPath;
    constructor(ns: NS, Args: RegularMinerArgs) {
        this.args = Args;
        this.ns = ns;
    }
    run() {
        return HackHelpers.TryHacking(this.ns, this, this.args.hostName, this.args.targetName);
    }
}

export async function main(ns: NS) {
    const hostname: string = ns.args[0].toString(), target = ns.args[1].toString();
    const initialMoney = ns.getServerMoneyAvailable(target);
    const securityThresh = ns.getServerMinSecurityLevel(target);
    if (!ns.hasRootAccess(target)) {
        ns.tprint("ERROR: No root access to target");
        ns.exit();
    }
    ns.tprint(`SUCCESS: Running in ${cyanStr(hostname)} targeting ${cyanStr(target)}:`)
    ns.tprint(`INFO \tSecurityThresh: ${cyanStr(ns.formatNumber(securityThresh))}`);
    while (true) {
        const curSecurityLevel = ns.getServerSecurityLevel(target), curMoneyAvailable = ns.getServerMoneyAvailable(target);
        if (curMoneyAvailable === 0) {
            ns.tprint(`ERROR: Target(${target}) is drained`);
            ns.exit();
        }
        ns.print('')
        ns.print(`INFO Targeting: ${target}`)
        ns.print(`INFO Current security level at: ${cyanStr(`${curSecurityLevel}/${securityThresh}`)}`)
        if (curSecurityLevel > securityThresh) {
            ns.print("INFO Weakening");
            await ns.weaken(target);
            ns.print("SUCCESS Weakened");
            ns.tprint(`SUCCESS Weakened from ${hostname}, targeting ${target}`);
        } else if (curMoneyAvailable < initialMoney) {
            ns.print("INFO Growing");
            await ns.grow(target);
            ns.print("SUCCESS Grew");
            ns.tprint(`SUCCESS Grew from ${hostname}, targeting ${target}`);
        } else {
            ns.print("INFO Hacking");
            await ns.hack(target);
            ns.print("SUCCESS Hacked");
            ns.tprint(`SUCCESS Hacked from ${hostname}, targeting ${target}`);
        }
    }
}
