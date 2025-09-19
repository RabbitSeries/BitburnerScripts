import React, { useRef } from "react"
import type { NS } from "@ns"
import { FindPathTo, ScanAllServers, TryNuke } from "/Hack/HackHelpers"
import { upgradeLevelBy, upgradeLevelTo } from "/HacknetBuyer"
import type { ProcessHandle } from "../OS/Process"

export function Toolbar({ ns, handle, callBack }: { ns: NS, handle: ProcessHandle, callBack: (action: 'Expand' | 'Collapse') => void }) {
    const expander = useRef<HTMLButtonElement>(null)
    const levelTo = useRef<HTMLDivElement>(null)
    const handlePrompt = () => {
        ns.prompt('Print path to: ', { type: "text" }).then(r => FindPathTo(ns, `${r}`)).then(ns.tprint).catch()
    }
    return <div style={{ display: "flex", flexDirection: "row" }}>
        <button ref={expander} onClick={() => {
            if (expander.current) {
                if (expander.current.textContent === "Expand") {
                    callBack("Expand")
                    expander.current.textContent = "Collapse"
                } else {
                    callBack("Collapse")
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
        <button onClick={handlePrompt}>
            Find Path
        </button>
        <button onClick={() => handle.close()}>Shut Down</button>
    </div>
}