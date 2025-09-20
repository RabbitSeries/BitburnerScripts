import type { NS } from "@ns";

export async function PuchaseServer(ns: NS) {
    const i = ns.getPurchasedServers().length
    const cost = ns.getPurchasedServerCost(2 ** 10)
    const wallet = ns.getServerMoneyAvailable("home")
    if (i < ns.getPurchasedServerLimit()) {
        if (wallet >= cost) {
            return `Bought ${ns.purchaseServer("pserv-" + i, 2 ** 10)}`
        } else {
            return `Too Expensive ${ns.formatNumber(wallet)}/${ns.formatNumber(cost)}`
        }
    } else {
        return `Limit Exceeded Holding ${i} Servers`
    }
}