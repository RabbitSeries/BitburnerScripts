import { NS, RunOptions } from "@ns";
import { IMiner, IMinerArgs, IMinerPath } from "./IMiner";
import { ConsoleColorPath, cyanStr } from "../Console/ConsoleColor";
import * as HackHelpers from "./HackHelpers";

export class SingleTaskMinerArgs implements IMinerArgs {
    hostName: string = "";
    targetName: string = "";
    scriptPath: string = "";
    threadOrOptions?: number | RunOptions;
    task: number = -1
}

export const SingleTaskMinerPath = 'Hack/SingleTaskMiner.js'

export class SingleTaskMiner implements IMiner {
    ns: NS;
    args: SingleTaskMinerArgs;
    constructor(ns: NS, Args: SingleTaskMinerArgs) {
        this.args = Args;
        this.ns = ns;
    }
    run() {
        return HackHelpers.TryHacking(this.ns, this, this.args.hostName, this.args.targetName, this.args.task);
    }
}

export async function main(ns: NS) {
    const hostname: string = ns.args[0].toString(), target = ns.args[1].toString(), task = ns.args[2].valueOf();
    const initialMoney = ns.getServerMoneyAvailable(target);
    if (!ns.hasRootAccess(target)) {
        ns.tprint("ERROR: No root access to target");
        ns.exit();
    }
    ns.tprint(`SUCCESS: Running in ${cyanStr(hostname)} targeting ${cyanStr(target)} with task ${task}`)
    while (true) {
        const curMoneyAvailable = ns.getServerMoneyAvailable(target);
        if (curMoneyAvailable === 0) {
            ns.tprint(`ERROR: Target(${target}) is drained`);
            ns.exit();
        }
        ns.print('')
        ns.print(`INFO Targeting: ${target}`)
        if (task === 0) {
            ns.print("INFO Hacking");
            await ns.hack(target);
            ns.print("SUCCESS Hacked");
            ns.tprint(`SUCCESS Hacked from ${hostname}, targeting ${target}`);
        } else if (task === 1) {
            ns.print("INFO Weakening");
            await ns.weaken(target);
            ns.print("SUCCESS Weakened");
            ns.tprint(`SUCCESS Weakened from ${hostname}, targeting ${target}`);
        } else if (task === 2) {
            ns.print("INFO Growing");
            await ns.grow(target);
            ns.print("SUCCESS Grew");
            ns.tprint(`SUCCESS Grew from ${hostname}, targeting ${target}`);
        } else {
            ns.print(`ERROR: Runtime error SglMiner is not able to fectch a task, passed task is ${task}`);
            ns.exit()
        }
    }
}
