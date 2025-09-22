import type { NS } from "@ns";
import React from "react";
import { CurrMoneyRate, PotentialMoneyRate } from "/utils/ServerStat";
import { Actions } from "./Actions";
export interface IServer {
    Rank: React.JSX.Element
    Host: React.JSX.Element
    Root: React.JSX.Element
    HackLevel: React.JSX.Element
    Ports: React.JSX.Element
    Money: React.JSX.Element
    Secrurity: React.JSX.Element
    HackTime: React.JSX.Element
    CurrMoneyRate: React.JSX.Element
    PotentialMoneyRate: React.JSX.Element
    RAM: React.JSX.Element
    Actions: React.JSX.Element
}
export function Server(ns: NS, host: string, rowId: number): IServer {
    // This must be rebuilt
    const stat = {
        moneyAvailable: ns.getServerMoneyAvailable(host),
        maxMoney: ns.getServerMaxMoney(host),
        maxRam: ns.getServerMaxRam(host),
        usedRam: ns.getServerUsedRam(host),
        curSecurity: ns.getServerSecurityLevel(host),
        minSecurity: ns.getServerMinSecurityLevel(host),
        hackTime: ns.getHackTime(host),
        growTIme: ns.getGrowTime(host),
        weakenTime: ns.getWeakenTime(host)
    }
    return {
        Rank: <td>{rowId}</td>,
        Host: <td>{host}</td>,
        Root: <td>{ns.hasRootAccess(host) ? '✔' : '✖'}</td>,
        HackLevel: <td>{ns.getHackingLevel()}/{ns.getServerRequiredHackingLevel(host)}</td>,
        Ports: <td>{ns.getServerNumPortsRequired(host)}</td>,
        Money: <td>{ns.formatNumber(stat.moneyAvailable, 1)}/{ns.formatNumber(stat.maxMoney, 1)}{`(${stat.maxMoney ? ns.formatPercent(stat.moneyAvailable / stat.maxMoney, 1) : "N/A"})`}</td>,
        Secrurity: <td>{ns.formatNumber(stat.minSecurity, 0)}/{ns.formatNumber(stat.curSecurity, 1)}</td>,
        HackTime: <tbody>
            <td>{ns.formatNumber(stat.hackTime / 1000 / 60, 1)} </td>
            <td>{ns.formatNumber(stat.weakenTime / 1000 / 60, 1)} </td>
            <td>{ns.formatNumber(stat.growTIme / 1000 / 60, 1)}</td>
        </tbody>,
        CurrMoneyRate: <td>{ns.formatNumber(CurrMoneyRate.bind(ns)(host), 1)}</td>,
        PotentialMoneyRate: <td>{ns.formatNumber(PotentialMoneyRate.bind(ns)(host), 1)}</td>,
        RAM: <td>{`${ns.formatNumber(stat.maxRam - stat.usedRam, 2)}/${ns.formatNumber(stat.maxRam, 2)}`}</td>,
        // Add a key to this, so the diff algorithm won't recreate new content for it
        Actions: <Actions key={host} host={host} ns={ns} ></Actions>
    }
}
export default function ServerNode({ ns, host, rowId }: { ns: NS, host: string, rowId: number }) {
    const server = Server(ns, host, rowId)
    return <tr className={ns.hasRootAccess(host) ? 'has-access' : 'no-access'} style={{ color: ns.hasRootAccess(host) ? 'cyan' : 'auto' }}>
        {Object.entries(server).map((K_V: [string, React.JSX.Element]) => K_V[1])}
    </tr>
}