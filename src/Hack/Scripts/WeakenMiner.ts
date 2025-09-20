import type { NS } from "@ns"
export async function main(ns: NS) {
    const target = ns.args[1].toString()
    await ns.weaken(target)
}
