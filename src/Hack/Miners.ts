
import { NS, RunOptions } from "@ns"
import { IMiner, IMinerArgs } from "/Hack/IMiner"
import * as HackHelpers from "/Hack/HackHelpers"
import { Tasks } from "/Hack/Tasks"

export const Miners = {
    RegularMiner: "RegularMiner",
    SingleTaskMiner: "SingleTaskMiner"
}
export class RegularMinerArgs implements IMinerArgs {
    hostName = ""
    targetName = ""
    scriptPath = ""
    threadOrOptions?: number | RunOptions
}

export const Paths = {
    RegularMinerPath: 'Hack/Scripts/RegularMiner.js',
    SingleTaskMinerPath: 'Hack/Scripts/SingleTaskMiner.js'
}

export class RegularMiner implements IMiner {
    ns: NS
    args: RegularMinerArgs
    scriptPath = Paths.RegularMinerPath
    constructor(ns: NS, Args: RegularMinerArgs) {
        this.args = Args
        this.ns = ns
    }
    run(): number {
        return HackHelpers.TryHacking(this.ns, this, this.args.hostName, this.args.targetName)
    }
}

export class SingleTaskMinerArgs implements IMinerArgs {
    hostName: string = ""
    targetName: string = ""
    threadOrOptions?: number | RunOptions
    task: Tasks = Tasks.Hack
}

export class SingleTaskMiner implements IMiner {
    ns: NS
    args: SingleTaskMinerArgs
    scriptPath: string = Paths.SingleTaskMinerPath
    constructor(ns: NS, Args: SingleTaskMinerArgs) {
        this.args = Args
        this.ns = ns
    }
    run(): number {
        return HackHelpers.TryHacking(this.ns, this, this.args.hostName, this.args.targetName, this.args.task)
    }
}
