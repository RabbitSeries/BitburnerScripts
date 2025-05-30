import { NS } from "@ns"

export async function main(ns: NS) {
    const ram = typeof ns.args[0] === "number" ? ns.args[0] : null
    if (ram) {
        let i = ns.getPurchasedServers().length
        ns.tprint(`Currently having ${i}/${ns.getPurchasedServerLimit()} servers`)
        while (i < ns.getPurchasedServerLimit()) {
            const cost = ns.getPurchasedServerCost(ram)
            const wallet = ns.getServerMoneyAvailable("home")
            ns.tprint(`Next server with ${ns.formatRam(ram)} costs ${ns.formatNumber(cost)}/${wallet}`)
            while (ns.getServerMoneyAvailable("home") < cost) {
                await ns.sleep(10000)
            }
            ns.tprint(`Buying ${i}_th/${ns.getPurchasedServerLimit()} server`)
            let hostname = ns.purchaseServer("pserv-" + i, ram)
            if (ns.fileExists("Miner.js", "home")) {
                ns.scp("Miner.js", hostname)
                // Neighbors = ns.scan("home")
                // Neighbor = Neighbors[Math.floor(Math.random() * Neighbors.length)]
                ns.exec("Miner.js", hostname, Math.floor(ram / ns.getScriptRam("Miner.js")), "joesguns")
            }
            ++i
            await ns.sleep(1000)
        }
        ns.tprint("Maximum servers reached")
    }
    return
}