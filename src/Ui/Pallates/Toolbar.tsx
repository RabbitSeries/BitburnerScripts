import React, { useRef } from "react"
import type { NS } from "@ns"
import { FindPathTo, ScanAllServers, TryNuke } from "/Hack/HackHelpers"
import { upgradeLevelBy, upgradeLevelTo } from "/HacknetBuyer"
import type { ProcessHandle } from "../OS/Process"
import { Miners, RegularMiner } from "/Hack/Miners"
import { PuchaseServer } from "/Hack/PrivateServer"
interface Notification {
    action: 'Expand' | 'Collapse'
}
export function Toolbar({ ns, handle, notifier }: { ns: NS, handle: ProcessHandle, notifier: (notification: Notification) => void }) {
    const expander = useRef<HTMLButtonElement>(null)
    const levelTo = useRef<HTMLLabelElement>(null)
    const { current: maxLevel } = useRef<() => number>(() => {
        const max = Math.max(...[...Array(ns.hacknet.numNodes())]
            .map((_, i) => i)
            .map(i => ns.hacknet.getNodeStats(i).level))
        return max
    })
    return <div style={{ display: "flex", flexDirection: "row" }}>
        <button ref={expander} onClick={() => {
            if (expander.current) {
                if (expander.current.textContent === "Expand") {
                    notifier({ action: "Expand" })
                    expander.current.textContent = "Collapse"
                } else {
                    notifier({ action: "Collapse" })
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
            if (levelTo.current) {
                const to = +(levelTo.current.textContent)
                for (const id in [...Array(ns.hacknet.numNodes())]) {
                    upgradeLevelTo(ns, +id, to)
                }
            }
        }}>UpgradeTo</button>
        <button onClick={() => { if (levelTo.current) levelTo.current.textContent = `${Math.max(+(levelTo.current.textContent) - 1, 0)}` }}>-</button>
        <button onClick={() => { if (levelTo.current) levelTo.current.textContent = `${Math.min(+(levelTo.current.textContent) + 1, 200)}` }}>+</button>
        {/* There seems to be multiple affect to this label's textcontent. (TODO: this behavior seems to be called referential equality, go check it out!)
            The parent is periodically refreshing all nodes.
            So this label's default value on every refresh.
            Each time refresh to maxLevel.
            But this label is also bind to ref.
            So the diff alogrithm will also diff this lable's ref.
            So the label's text content will change if either of the following changes:
                - maxLevel's returned value
                - levelTo ref's current.textcontent
            if neither changes, content remains unchanged.
            After changed the content stays the either refreshed value, it won't affect ref's value
        */}
        <label ref={levelTo} onClick={async ({ currentTarget }) =>
            currentTarget.textContent = `${Math.max(Math.min(+`${await ns.prompt("Upgrade to: ", { type: "text" })}`, 200), 0)}`}>{maxLevel()}</label>
        <button onClick={() => ns.prompt('Print path to: ', { type: "text" }).then(r => FindPathTo(ns, `${r}`)).then(r => ns.alert(`${r ? r.map(r => `connect ${r}`).join(";") : "NULL"}`)).catch()}>
            Find Path
        </button>
        <button onClick={() => handle.close()}>Shut Down</button>
        <button onClick={() => ns.prompt("Specify target", { type: "text" }).then(r => `${r}`).then(r => {
            new RegularMiner(ns, {
                hostName: "home",
                targetName: r,
                threadOptions: Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) / ns.getScriptRam(Miners.RegularMiner.scriptPath))
            }).run()
        }).catch(ns.tprint)}>Use Home Resources</button>
        <button onClick={() => PuchaseServer(ns).then(ns.tprint).catch(ns.tprint)}>Purchase a server</button>
    </div>
}