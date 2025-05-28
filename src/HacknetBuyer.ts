import { NS } from "@ns";

async function upgradeLevelBy(ns: NS, nodeId: number, delta: number) {
    ns.print(`Upgrading ${nodeId} by ${delta}`);
    BuySomething(
        ns,
        ns.hacknet.getLevelUpgradeCost(nodeId, delta),
        (ns, nodeId, delta) => ns.hacknet.upgradeLevel(nodeId, delta),
        10000,
        null,
        nodeId, delta
    )
}

async function upgradeLevelTo(ns: NS, nodeId: number, level: number) {
    ns.print(`Upgrading ${nodeId} to ${level}`);
    const delta = level - ns.hacknet.getNodeStats(nodeId).level;
    if (level > 0) {
        await BuySomething(
            ns,
            ns.hacknet.getLevelUpgradeCost(nodeId, delta),
            (ns, nodeId, delta) => ns.hacknet.upgradeLevel(nodeId, delta),
            10000,
            null,
            nodeId, delta
        )
    }
}

async function BuySomething(
    ns: NS,
    cost: number,
    purchaseAction: (ns: NS, ...args: any[]) => boolean,
    timeout: number,
    callback: (() => void) | ((err: Error | null) => void) | null,
    ...args: any[]) {

    const wallet = ns.getServerMoneyAvailable("home");
    while (wallet < cost) {
        await ns.sleep(timeout);
    }
    let status = false, e: Error | null = null;
    try {
        status = purchaseAction(ns, ...args);
    }
    catch (err) {
        e = err instanceof Error ? err : null;
    }
    finally {
        if (callback !== null) {
            callback(e);
        }
    }
    return status;
}

export async function main(ns: NS) {
    const hacknet = ns.hacknet;
    ns.print(`Currently having ${hacknet.numNodes()}/${hacknet.maxNumNodes()} nodes`);
    while (hacknet.numNodes() < 30) {
        const cost = hacknet.getPurchaseNodeCost();
        const wallet = ns.getServerMoneyAvailable("home");
        ns.print(`Next node with costs ${ns.formatNumber(cost)}/${ns.formatNumber(wallet)}`);
        while (wallet < cost) {
            ns.print(`Nodes: ${ns.hacknet.numNodes()}`);
            const maxLevel = [...Array(ns.hacknet.numNodes())].map(function (this: NS, _, i) {
                return this.hacknet.getNodeStats(i).level;
            }, ns).reduce((init, v) => Math.max(init, v), 0);
            for (let id = 0; id < hacknet.numNodes(); id++) {
                await upgradeLevelTo(ns, id, maxLevel + 1);
            }
            await ns.sleep(10000);
        }
        ns.print(`Buying ${hacknet.numHashes()}_th/${hacknet.maxNumNodes()} node`);
        await ns.sleep(1000);
    }
    ns.print("Maximum nodes reached");
    ns.exit();
}