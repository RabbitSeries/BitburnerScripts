import type { NS } from "@ns";
import React from "react"
import { Server } from "/Ui/Table/Server";
// import "./ServerNode.css"
export default function ServerNode({ ns, host, rowId }: { ns: NS, host: string, rowId: number }) {
    const server = Server(ns, host, rowId)
    return (
        <tr key={host} className={ns.hasRootAccess(host) ? 'has-access' : 'no-access'} style={{ color: ns.hasRootAccess(host) ? 'cyan' : 'auto' }}>
            {Object.entries(server).map((K_V: [string, React.JSX.Element]) => K_V[1])}
        </tr>
    )
}