import React from '/lib/react';
import { upgradeLevelBy, upgradeLevelTo } from "/HacknetBuyer";
import type { NS } from "@ns";
import { Comparator, RootAccessRank, CurrentMoneyRank, PotentialMoneyRank } from "/utils/Comparators";
import ServerNode from '/Ui/Table/ServerNode';
import { ScanAllServers, TryNuke } from '/Hack/HackHelpers';
export default function HackOS({ servers, ns }: { servers: string[], ns: NS }) {
    const rootAccessRanker = Comparator.sortBy(RootAccessRank.bind(ns));
    const [ranker, setRanker] = React.useState(rootAccessRanker.thenSortBy(CurrentMoneyRank.bind(ns)))
    const [rows, setRows] = React.useState(servers.sort(ranker.compare).slice(0, 10))
    const sorted = rows.toSorted(ranker.compare)
    const timer = React.useRef<HTMLDivElement>(null)
    const clickTimeOut = React.useRef<NodeJS.Timeout>(null);
    const expander = React.useRef<HTMLButtonElement>(null);
    const levelTo = React.useRef<HTMLDivElement>(null);
    const handleClick = (comparator: Comparator) => {
        if (clickTimeOut.current) {
            clickTimeOut.current = null;
            return new Promise<Comparator>((resolve) => {
                resolve(comparator.reversed())
            });
        }
        return new Promise<Comparator>((resolve, reject) => {
            clickTimeOut.current = setTimeout(() => {
                if (clickTimeOut.current === null) {
                    reject("Double clicked or clicked status lost");
                } else {
                    resolve(comparator)
                }
                clickTimeOut.current = null;
            }, 200)
        },)
    }
    React.useEffect(() => {
        const interval = setInterval(() => {
            if (timer.current) {
                timer.current.textContent = `${Math.floor(Date.now() / 1000) % 60}`;
            }
            setRows([...rows])
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    })
    return (
        <div className="multi-server-container">
            <h2>Network Server Information (Sorted by Money/HackTime Efficiency)</h2>
            <div ref={timer}>Nah</div>
            <button ref={expander} onClick={() => {
                if (expander.current) {
                    if (expander.current.textContent === "Expand") {
                        setRows(servers)
                        expander.current.textContent = "Collapse"
                    } else {
                        setRows(sorted.slice(0, 10))
                        expander.current.textContent = "Expand"
                    }
                }
            }}>Expand</button>
            <button onClick={() => {
                for (const host of ScanAllServers(ns).valueset) {
                    TryNuke(ns, host)
                }
            }}>NukeAll</button>
            <button onClick={() => {
                for (const id in [...Array(ns.hacknet.numNodes())]) {
                    upgradeLevelBy(ns, +id, 1);
                }
            }}>UpgradeHackNode</button>
            <button onClick={() => {
                for (const id in [...Array(ns.hacknet.numNodes())]) {
                    if (levelTo.current) {
                        upgradeLevelTo(ns, +id, +levelTo.current.textContent);
                    }
                }
            }}>UpgradeTo</button>
            <button onClick={() => { if (levelTo.current) levelTo.current.textContent = `${Math.max(+(levelTo.current.textContent) - 1, 0)}` }}>-</button>
            <button onClick={() => { if (levelTo.current) levelTo.current.textContent = `${+(levelTo.current.textContent) + 1}` }}>+</button>
            <div ref={levelTo}>{Math.max(...[...Array(ns.hacknet.numNodes())].map((_, i) => i).map(i => ns.hacknet.getNodeStats(i).level))}</div>
            <table className="server-table">
                <thead>
                    <tr>
                        <th>Rank </th>
                        <th>Server </th>
                        <th onClick={() => handleClick(rootAccessRanker).then(setRanker).catch(ns.print)}>Root </th>
                        <th>Hack Level </th>
                        <th>Ports </th>
                        <th>Money </th>
                        <th>Security </th>
                        <th>HWG Time/mins </th>
                        {[
                            { n: "Current$/s", r: rootAccessRanker.thenSortBy(CurrentMoneyRank.bind(ns)) },
                            { n: "Potential$/s", r: rootAccessRanker.thenSortBy(PotentialMoneyRank.bind(ns)) }]
                            .map(({ n, r }) => <th onClick={() => handleClick(r).then(setRanker).catch(ns.print)}>{n} </th>)}
                        <th>RAM </th>
                        <th style={{ textAlign: "center" }}>Action </th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((host, rowId) => {
                        return (<ServerNode ns={ns} host={host} rowId={rowId + 1} ></ServerNode>)
                    })}
                </tbody>
            </table>
        </div>
    );
};
