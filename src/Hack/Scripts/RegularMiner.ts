import type { NS } from "@ns"
import { cyanStr } from "/Console/ConsoleColor"

export async function main(ns: NS) {
    const hostname: string = ns.args[0].toString(), target = ns.args[1].toString()
    const initialMoney = ns.getServerMoneyAvailable(target)
    const securityThresh = ns.getServerMinSecurityLevel(target) * 1.2
    if (!ns.hasRootAccess(target)) {
        ns.print("ERROR: No root access to target")
        return
    }
    ns.print(`SUCCESS: Running in ${cyanStr(hostname)} targeting ${cyanStr(target)}:`)
    while (true) {
        const curSecurityLevel = ns.getServerSecurityLevel(target), curMoneyAvailable = ns.getServerMoneyAvailable(target)
        if (curMoneyAvailable === 0) {
            ns.print(`WARN: Target(${target}) is drained`)
        }
        ns.print('')
        ns.print(`INFO Targeting: ${target}`)
        ns.print(`INFO Current security level at: ${cyanStr(`${curSecurityLevel}/${securityThresh}`)}`)
        if (curSecurityLevel > securityThresh) {
            ns.print("INFO Weakening")
            await ns.weaken(target)
            ns.print("SUCCESS Weakened")
            ns.print(`SUCCESS Weakened from ${hostname}, targeting ${target}`)
        } else if (curMoneyAvailable < initialMoney) {
            ns.print("INFO Growing")
            await ns.grow(target)
            ns.print("SUCCESS Grew")
            ns.print(`SUCCESS Grew from ${hostname}, targeting ${target}`)
        } else {
            ns.print("INFO Hacking")
            await ns.hack(target)
            ns.print("SUCCESS Hacked")
            ns.print(`SUCCESS Hacked from ${hostname}, targeting ${target}`)
        }
    }
}
