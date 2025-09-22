import type { NS, RunOptions } from "@ns"
import type { IMiner, IMinerArgs } from "../Miners/IMiner"
import { ScanAllServers, TryHacking } from "../HackHelpers"
import { type TaskQueue, ScheduleWeakenTask, ScheduleHackTask, ScheduleGrowTask, type Handler, HostHandlers } from "./ScheduleHelpers"

const prefix = "Hack/Scripts/"
export const Schedulers = {
    FullScheduler: {
        scriptPath: prefix + "FullScheduler.js"
    }
}
export class FullScheduler implements IMiner {
    scriptPath = Schedulers.FullScheduler.scriptPath
    constructor(ns: NS, targetName: string) {
        this.args = { hostName: "home", targetName }
        this.ns = ns
        this.threadOptions = 1
    }
    args: IMinerArgs
    ns: NS
    threadOptions: number | RunOptions
    run = () => TryHacking(this.ns, this, this.args.targetName)
    static async attach(ns: NS, target: string, servers?: string[],
        preHandler: Handler = HostHandlers["KillallExceptHome"],
        postHandler: Handler = HostHandlers["ShareOnHost"]
    ) {
        const maxMoney = ns.getServerMaxMoney(target)
        if (maxMoney === 0) {
            ns.print("Zero maxmoney, exit")
            return
        }
        const scan = servers === undefined
        while (true) {
            if (scan) servers = ScanAllServers(ns).sorted.filter(s => ns.hasRootAccess(s) && ns.getServerMaxRam(s) > 0)
            const hackCondition = ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target) >= 0.95,
                weakenCondition = ns.getServerMinSecurityLevel(target) / ns.getServerSecurityLevel(target) <= 0.95
            const taskq: TaskQueue = []
            if (weakenCondition) {
                taskq.push(...ScheduleWeakenTask(ns, servers!, target, preHandler, postHandler))
            } else if (hackCondition) {
                taskq.push(...ScheduleHackTask(ns, servers!, target, preHandler, postHandler))
            } else {
                taskq.push(...ScheduleGrowTask(ns, servers!, target, preHandler, postHandler))
            }
            ns.print("Done distributing")
            while (taskq.length > 0) {
                const task = await taskq.shift()!
                if (task === null) {
                    continue
                }
                const watchDog = async () => {
                    const running = ns.getRunningScript(task.pid)
                    if (running) {
                        ns.print(`WARN: Woof!!! Script has ran ${ns.tFormat(running.onlineRunningTime)}`)
                        ns.print(`Logs: ${running.logs}`)
                        return new Promise<void>((resolve) => {
                            setTimeout(async () => {
                                await watchDog()
                                resolve()
                            }, 1000)
                        })
                    }
                }
                await watchDog()
            }
            // ns.clearLog()
            // TODO Add better logging
            // ns.printRaw(<CountDown timer={taskDuration}>Host: {host} Target: {target}</CountDown>)
            ns.print("Task queue is empty, continue to next round")
            if (hackCondition) {
                // My computer sucks, these cat't be logged in 100ms
                // ns.print(JSON.stringify(threadBoost), ` ${i} `, " ", host, " Waited ", ns.tFormat(Date.now() - begin), " Hypotential wait time ", ns.tFormat(waken2Finish))
                ns.print("Server money: ", ns.formatPercent(ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target)))
                ns.print("Server sercuritylevel increased: ", ns.formatNumber(ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target), 2))
            }
            // break
        }
    }
}
