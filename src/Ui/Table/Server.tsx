import { NS } from "@ns"
import React from "/lib/react";
import { IServer } from "/Ui/Table/IServer"
import { CurrMoneyRate, PotentialMoneyRate } from "/utils/ServerStat";
import { Tasks } from "/Hack/Tasks";
import { BFSDistributor } from "/BFSDistributor";
import { Paths, SingleTaskMiner } from "/Hack/Miners";
import { FindPathTo } from "/Hack/HackHelpers";
function SProvider(ns: NS, hostName: string, rowId: number, targetName: string, tasks: Tasks[]) {
    return new SingleTaskMiner(ns, {
        hostName,
        targetName,
        task: tasks[rowId % tasks.length],
        threadOrOptions: Math.floor(ns.getServerMaxRam(hostName) / ns.getScriptRam(Paths.SingleTaskMinerPath))
    })
}
export function Server(ns: NS, host: string, rowId: number): IServer {
    const moneyAvailable = ns.getServerMoneyAvailable(host), maxMoney = ns.getServerMaxMoney(host),
        maxRam = ns.getServerMaxRam(host), usedRam = ns.getServerUsedRam(host),
        curSecurity = ns.getServerSecurityLevel(host), minSecurity = ns.getServerMinSecurityLevel(host),
        hackTime = ns.getHackTime(host), growTIme = ns.getGrowTime(host), weakenTime = ns.getWeakenTime(host)
    const tasks = [Tasks.Hack, Tasks.Hack, Tasks.Weaken, Tasks.Weaken, Tasks.Weaken, Tasks.Grow, Tasks.Grow]
    return {
        Rank: <td>{rowId}</td>,
        Host: <td>{host}</td>,
        Root: <td>{ns.hasRootAccess(host) ? '✔' : '✖'}</td>,
        HackLevel: <td>{ns.getHackingLevel()}/{ns.getServerRequiredHackingLevel(host)}</td>,
        Ports: <td>{ns.getServerNumPortsRequired(host)}</td>,
        Money: <td>{ns.formatNumber(moneyAvailable, 1)}/{ns.formatNumber(maxMoney, 1)}{`\t(${maxMoney ? ns.formatPercent(moneyAvailable / maxMoney, 1) : "N/A"})\t`}</td>,
        Secrurity: <td>{ns.formatNumber(minSecurity, 0)}/{ns.formatNumber(curSecurity, 1)}</td>,
        HackTime: <tbody>
            <td>{ns.formatNumber(hackTime / 1000 / 60, 1)} </td>
            <td>{ns.formatNumber(weakenTime / 1000 / 60, 1)} </td>
            <td>{ns.formatNumber(growTIme / 1000 / 60, 1)}</td>
        </tbody>,
        CurrMoneyRate: <td>{ns.formatNumber(CurrMoneyRate(ns, host), 1)}</td>,
        PotentialMoneyRate: <td>{ns.formatNumber(PotentialMoneyRate(ns, host), 1)}</td>,
        RAM: <td>{`${ns.formatNumber(maxRam - usedRam, 2)}/${ns.formatNumber(maxRam, 2)}`}</td>,
        Actions: <tbody>{(Object.keys(Tasks).map(Number).filter(k => !isNaN(k)) as Tasks[]).map(task => {
            return (
                <td key={`${host}${task}`} onMouseDown={({ currentTarget }) => {
                    BFSDistributor(ns, host, (from: string) => SProvider(ns, from, rowId, host, [task]))
                        .then(stat => currentTarget.textContent = `${Tasks[task]}[${stat ? '✔' : '✖'}]`)
                }}>{`${Tasks[task]}[✖]`}</td>
            )
        })}
            <td key={`${host}Regular`} onMouseDown={({ currentTarget }) => {
                BFSDistributor(ns, host, (from: string) => SProvider(ns, from, rowId, host, tasks)).then(stat => currentTarget.textContent = `Cycle[${stat ? '✔' : '✖'}]`)
            }}>{`Cycle[✖]`}
            </td>
            <td key={`${host}BackDoor`} onMouseDown={({ currentTarget }) => {
                new Promise((resolve, reject) => {
                    if (ns.hasRootAccess(host)) {
                        const pathToHost = FindPathTo(ns, host)
                        if (pathToHost) {
                            ns.tprint(pathToHost)
                            for (const server of pathToHost) {
                                ns.tprint(server, ns.singularity.connect(server))
                            }
                            resolve("Done")
                            currentTarget.textContent = `BackDoor[✔]`
                            return;
                        }
                    }
                    reject("Invalid host")
                }).then().catch(ns.tprint)
            }}>{`BackDoor[✖]`}</td>
        </tbody >
    }
}