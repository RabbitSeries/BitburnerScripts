
import type { NS, RunOptions } from "@ns"
import type { IMiner, IMinerArgs } from "/Hack/IMiner"
import * as HackHelpers from "/Hack/HackHelpers"
import { HackTask } from "./Task"
import { FreeRam } from "/utils/ServerStat"
export const Miners = {
    RegularMiner: {
        name: "RegularMiner",
        scriptPath: 'Hack/Scripts/RegularMiner.js'
    },
    SingleTaskMiner: {
        name: "SingleTaskMiner",
        scriptPath: 'Hack/Scripts/SingleTaskMiner.js'
    },
    HackMiner: {
        name: "HackMiner",
        scriptPath: 'Hack/Scripts/HackMiner.js',
    },
    GrowMiner: {
        name: "GrowMiner",
        scriptPath: 'Hack/Scripts/GrowMiner.js',
    },
    WeakenMiner: {
        name: "WeakenMiner",
        scriptPath: 'Hack/Scripts/WeakenMiner.js',
    },
    MemSharer: {
        name: "Memsharer",
        scriptPath: "Hack/Scripts/MemSharer.js"
    }
}

export class RegularMiner implements IMiner {
    ns: NS
    args: IMinerArgs
    scriptPath = Miners.RegularMiner.scriptPath
    threadOptions: number | RunOptions
    constructor(ns: NS, Args: IMinerArgs) {
        this.args = Args
        this.ns = ns
        this.threadOptions = this.args.threadOptions ?? Math.floor(FreeRam.bind(ns)(this.args.hostName) / ns.getScriptRam(this.scriptPath))
    }
    run = () => HackHelpers.TryHacking(this.ns, this, this.args.targetName)
}

export interface SingleTaskMinerArgs extends IMinerArgs {
    task: HackTask
}

export class SingleTaskMiner implements IMiner {
    ns: NS
    args: IMinerArgs
    task: HackTask
    scriptPath = Miners.SingleTaskMiner.scriptPath
    threadOptions: number | RunOptions
    constructor(ns: NS, Args: SingleTaskMinerArgs) {
        this.args = Args
        this.ns = ns
        this.task = Args.task
        this.threadOptions = this.args.threadOptions ?? Math.floor(FreeRam.bind(ns)(this.args.hostName) / ns.getScriptRam(this.scriptPath))
    }
    run = () => HackHelpers.TryHacking(this.ns, this, this.args.targetName, this.task)
}
export class HackMiner implements IMiner {
    args: IMinerArgs
    ns: NS
    scriptPath = Miners.HackMiner.scriptPath
    threadOptions: number
    constructor(ns: NS, hostName: string, targetName: string, threadOptions: number) {
        this.args = { hostName, targetName }
        this.ns = ns
        this.threadOptions = threadOptions
    }
    run = () => HackHelpers.TryHacking(this.ns, this, this.args.targetName)
}
export class WeakenMiner extends HackMiner {
    scriptPath = Miners.WeakenMiner.scriptPath
}
export class GrowMiner extends HackMiner {
    scriptPath = Miners.GrowMiner.scriptPath
}
export class MemSharer extends HackMiner {
    scriptPath: string = Miners.MemSharer.scriptPath
    constructor(ns: NS, hostName: string, threadOptions: number) {
        super(ns, hostName, hostName, threadOptions)
    }
    run = () => HackHelpers.TryHacking(this.ns, this)
}
