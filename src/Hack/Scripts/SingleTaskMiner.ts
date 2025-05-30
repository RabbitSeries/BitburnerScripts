import { NS } from "@ns"
import { cyanStr } from "/Console/ConsoleColor"
import { Tasks } from "/Hack/Tasks"
export async function main(ns: NS) {
    const hostname: string = ns.args[0].toString(), target = ns.args[1].toString(), task = ns.args[2].valueOf()
    if (!ns.hasRootAccess(target)) {
        ns.print(`ERROR: No root access to target ${target}`)
        return
    }
    ns.print(`SUCCESS: Running in ${cyanStr(hostname)} targeting ${cyanStr(target)} with task ${task} `)
    while (true) {
        const curMoneyAvailable = ns.getServerMoneyAvailable(target)
        if (curMoneyAvailable === 0) {
            ns.print(`WARN: Target(${target}) is drained`)
        }
        ns.print('')
        ns.print(`INFO Targeting: ${target} `)
        if (task === Tasks.Hack) {
            ns.print("INFO Hacking")
            await ns.hack(target)
            ns.print("SUCCESS Hacked")
            ns.print(`SUCCESS Hacked from ${hostname}, targeting ${target} `)
        } else if (task === Tasks.Weaken) {
            ns.print("INFO Weakening")
            await ns.weaken(target)
            ns.print("SUCCESS Weakened")
            ns.print(`SUCCESS Weakened from ${hostname}, targeting ${target} `)
        } else if (task === Tasks.Grow) {
            ns.print("INFO Growing")
            await ns.grow(target)
            ns.print("SUCCESS Grew")
            ns.print(`SUCCESS Grew from ${hostname}, targeting ${target} `)
        } else {
            ns.print(`ERROR: Runtime error SglMiner is not able to fectch a task, passed task is ${task} `)
            return
        }
    }
}
