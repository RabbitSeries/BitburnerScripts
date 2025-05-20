import React from "./lib/react";
import type { NS } from "@ns";
import ServerInfo, { FormattedServerInfo } from './lib/ServerInfo';
export async function main(ns: NS): Promise<void> {
    // First collect all server names
    const allServers = scanAllServers(ns);

    // Then pre-format all data before rendering
    const formattedServers: FormattedServerInfo[] = [];

    for (const hostname of allServers) {
        const currentMoney = ns.getServerMoneyAvailable(hostname);
        const maxMoney = ns.getServerMaxMoney(hostname);
        const hackTime = ns.getHackTime(hostname);
        const moneyPerHackTime = maxMoney > 0 && hackTime > 0 ? currentMoney / hackTime : 0;
        formattedServers.push({
            hostname,
            hasRootAccess: ns.hasRootAccess(hostname),
            hackingLevel: ns.formatNumber(ns.getHackingLevel(), 0),
            requiredHackingLevel: ns.formatNumber(ns.getServerRequiredHackingLevel(hostname), 0),
            portsRequired: ns.formatNumber(ns.getServerNumPortsRequired(hostname), 0),
            currentMoney: ns.formatNumber(currentMoney, 2),
            maxMoney: ns.formatNumber(maxMoney, 2),
            moneyPercent: maxMoney > 0 ? (currentMoney / maxMoney * 100).toFixed(2) + '%' : 'N/A',
            minSecurity: ns.formatNumber(ns.getServerMinSecurityLevel(hostname), 2),
            currentSecurity: ns.formatNumber(ns.getServerSecurityLevel(hostname), 2),
            hackTime: ns.tFormat(hackTime),
            growTime: ns.tFormat(ns.getGrowTime(hostname)),
            weakenTime: ns.tFormat(ns.getWeakenTime(hostname)),
            moneyPerHackTime: ns.formatNumber(moneyPerHackTime, 2),
            rawMoneyPerHackTime: moneyPerHackTime
        });
    }
    ns.clearLog();
    ns.tprintRaw(<ServerInfo servers={formattedServers} ns={ns} />);
    ns.tprint(`SUCCESS: DONE NETWORK PARSING`);
    while (true) {
        await ns.asleep(1000);
    }
}

function scanAllServers(ns: NS): string[] {
    const visited = new Set<string>();
    const queue = ["home"];
    visited.add("home");

    while (queue.length > 0) {
        const current = queue.shift()!;
        for (const neighbor of ns.scan(current)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return Array.from(visited);
}