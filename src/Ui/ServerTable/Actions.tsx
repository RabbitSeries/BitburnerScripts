import type { NS } from "@ns"
import { HackTask } from "/Hack/HackHelpers"
import React, { useRef } from "react"
import { BFSDistributor } from "/BFSDistributor"
import { CycleProvider, RProvider } from "../../Hack/Miners/Providers"
import { FullScheduler } from "../../Hack/Schedulers/Schedulers"
export function Actions({ ns, host }: { ns: NS, host: string }) {
    // const tasks = useRef([Task.Hack, Task.Hack, Task.Weaken, Task.Weaken, Task.Weaken, Task.Grow, Task.Grow]).current
    const options = useRef([{ name: "Hack", task: HackTask.Hack }, { name: "Weaken", task: HackTask.Weaken }, { name: "Grow", task: HackTask.Grow }]).current
    return <tbody>{options.map(({ name, task }) => {
        return <td key={`${host}${task}`} onMouseDown={({ currentTarget }) => {
            BFSDistributor(ns, host, new CycleProvider(ns, [task]))
                .then(stat => currentTarget.textContent = `${name}[${stat ? '✔' : '✖'}]`).catch(ns.tprint)
        }}>{`${name}[✖]`}</td>
    })}
        <td key={`${host}Cycle`} onMouseDown={({ currentTarget }) => {
            BFSDistributor(ns, host, new RProvider(ns))
                .then(stat => currentTarget.textContent = `Cycle[${stat ? '✔' : '✖'}]`).catch(ns.tprint)
        }}>{`Cycle[✖]`}</td>
        <td key={`${host}FullScheduler`} onMouseDown={({ currentTarget }) =>
            new Promise<number>((resolve) => {
                resolve(new FullScheduler(ns, host).run())
            }).then(t => {
                ns.print(`${t ? `Running SmartDistributor in pid ${t}` : "Failed to run FullScheduler"}`)
                if (t) currentTarget.textContent = `Looping`
            }).catch(ns.tprint)
        }>{`FullScheduler[✖]`}</td>
    </tbody >
}
