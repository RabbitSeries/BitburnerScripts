import type { NS } from "@ns"
import { FullScheduler } from "../Schedulers/Schedulers"
export async function main(ns: NS) {
    ns.disableLog("ALL")
    const target = ns.args[0].toString()
    await FullScheduler.attach(ns, target)
}