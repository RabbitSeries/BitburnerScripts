import type { NS } from "@ns";
import React, { useCallback, useRef } from "react";
import { Comparator, CurrentMoneyRateRank, HackLevelRank, HackTimeRank, MaxMoneyRank, PotentialMoneyRank, RootAccessRank, SecurityLevelRank } from "/utils/Comparators";
export function TableHeader({ ns, setRanker }: { ns: NS, setRanker: (ranker: Comparator) => void }) {
    const clickTimeOut = useRef<NodeJS.Timeout>(null)
    const handleClick = useCallback((comparator: Comparator) => {
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
        })
    }, [])
    const { current: content } = useRef<Record<string, Comparator | null>>({
        "Rank": null,
        "Server": null,
        "Root": Comparator.sortBy(RootAccessRank.bind(ns)),
        "Hack Level": Comparator.sortBy(HackLevelRank.bind(ns)),
        "Ports": null,
        "Money": Comparator.sortBy(RootAccessRank.bind(ns)).thenSortBy(MaxMoneyRank.bind(ns)),
        "Security": Comparator.sortBy(RootAccessRank.bind(ns)).thenSortBy(SecurityLevelRank.bind(ns)),
        "HWG Time/mins": Comparator.sortBy(RootAccessRank.bind(ns)).thenSortBy(HackTimeRank.bind(ns)),
        "Current$/s": Comparator.sortBy(RootAccessRank.bind(ns)).thenSortBy(CurrentMoneyRateRank.bind(ns)),
        "Potential$/s": Comparator.sortBy(RootAccessRank.bind(ns)).thenSortBy(PotentialMoneyRank.bind(ns)),
        "RAM": Comparator.sortBy(RootAccessRank.bind(ns)).thenSortBy((a, b) => ns.getServerMaxRam(b) - ns.getServerMaxRam(a)),
    })
    return <thead>
        <tr>
            {Object.entries(content).map(([n, r]) => <th onClick={() => { if (r) handleClick(r).then(setRanker).catch(ns.print) }}>{n} </th>)}
            <th style={{ textAlign: "center" }}>Action </th>
        </tr>
    </thead>
}