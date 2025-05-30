import React from "lib/react";
import type { NS } from "@ns";
import ServerInfo, { FormattedServerInfo } from 'Ui/ServerInfo';
import * as HackHelpers from "./Hack/HackHelpers";
export async function main(ns: NS): Promise<void> {
    const allServers = HackHelpers.ScanAllServers(ns);

    const formattedServers: FormattedServerInfo[] = [];

    for (const hostname of allServers.valueset) {
        const currentMoney = ns.getServerMoneyAvailable(hostname);
        const maxMoney = ns.getServerMaxMoney(hostname);
        const hackTime = ns.getHackTime(hostname);
        const moneyPerHackTime = currentMoney > 0 && hackTime > 0 && maxMoney > 0 ? currentMoney / hackTime : 0;
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
    ns.tprintRaw(<ServerInfo servers={formattedServers} ns={ns} />);
    while (true) {
        await ns.asleep(1000);
    }
}
