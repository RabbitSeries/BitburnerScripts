import { IMiner, IMinerArgs, IMinerPath, scp } from "./IMiner";
import { ConsoleColorPath, cyanStr } from "../Console/ConsoleColor";
import { NS, RunOptions } from "@ns";

export class RegularMinerArgs implements IMinerArgs {
    hostname: string;
    targetname: string;
    threadOrOptions?: number | RunOptions;
}
export const RegularMinerPath = 'Hack/RegularMiner.js'
const Hierachy = [RegularMinerPath, IMinerPath, ConsoleColorPath]
export class RegularMiner implements IMiner {
    ns: NS;
    Args: IMinerArgs;
    HierachyPaths = Hierachy;
    ScriptPath = RegularMinerPath;
    constructor(ns: NS, Args: IMinerArgs) {
        this.Args = Args;
        this.ns = ns;
    }
    /**
     * 
     * @returns — Returns the PID of a successfully started script, and 0 otherwise.
     */
    exec() {
        scp(this.ns, this, this.Args.targetname);
        return this.ns.exec(this.ScriptPath, this.Args.hostname, this.Args.threadOrOptions, this.Args.hostname, this.Args.targetname)
    }
    getMaxThread = () => typeof this.Args.threadOrOptions === 'number' ? this.Args.threadOrOptions : this.Args.threadOrOptions.threads;
}

export async function main(ns: NS) {
    const hostname: string = ns.args[0].toString(), target = ns.args[1].toString();
    const initialMoney = ns.getServerMaxMoney(target);
    //  Math.min(ns.getServerMoneyAvailable(target), ns.getServerMaxMoney(target) * 0.8);
    const securityThresh = ns.getServerMinSecurityLevel(target) * 2;
    if (!ns.hasRootAccess(target)) {
        ns.tprint("ERROR: No root access to target");
        ns.exit();
    }
    ns.tprint(`SUCCESS: Running in ${cyanStr(hostname)} targeting ${cyanStr(target)}:`)
    ns.tprint(`INFO \tMonney: ${cyanStr(ns.formatNumber(ns.getServerMoneyAvailable(target)))}/${cyanStr(ns.formatNumber(ns.getServerMaxMoney(target)))}`)
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
        ns.print(`INFO Current money available at: ${cyanStr(`${ns.formatNumber(curMoneyAvailable)}/${ns.formatNumber(initialMoney)}`)}`);
        if (curSecurityLevel > securityThresh) {
            ns.print("INFO Weakening");
            await ns.weaken(target);
            ns.print("SUCCESS Weakening");
        } else if (curMoneyAvailable < initialMoney) {
            ns.print("INFO Growing");
            await ns.grow(target);
            ns.print("SUCCESS Growing");
        } else {
            ns.print("INFO Hacking");
            await ns.hack(target);
            ns.print("SUCCESS Hacking");
        }
    }
}
