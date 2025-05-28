import React from 'lib/react';
import type { NS } from "@ns";

interface FormattedServerInfo {
    hostname: string;
    hasRootAccess: boolean;
    hackingLevel: string;
    requiredHackingLevel: string;
    portsRequired: string;
    currentMoney: string;
    maxMoney: string;
    moneyPercent: string;
    minSecurity: string;
    currentSecurity: string;
    hackTime: string;
    growTime: string;
    weakenTime: string;
    moneyPerHackTime: string;
    rawMoneyPerHackTime: number;
}


interface ServerInfoProps {
    servers: FormattedServerInfo[];
    ns: NS;
}

const ServerInfo = ({ servers, ns }: ServerInfoProps) => {
    const sortedServers = [...servers].sort(
        (a, b) => {
            if (a.hasRootAccess && b.hasRootAccess) {
                return b.rawMoneyPerHackTime - a.rawMoneyPerHackTime;
            } else if (a.hasRootAccess) {
                return -1;
            } else if (b.hasRootAccess) {
                return 1;
            } else {
                return b.rawMoneyPerHackTime - a.rawMoneyPerHackTime;
            }
        }
    );

    return (
        <div className="multi-server-container">
            <h2>Network Server Information (Sorted by Money/HackTime Efficiency)</h2>
            <table className="server-table">
                <thead>
                    <tr>
                        <th>Rank        </th>
                        <th>Server      </th>
                        <th>Root        </th>
                        <th>Hack Level  </th>
                        <th>Ports       </th>
                        <th>Money       </th>
                        <th>%           </th>
                        <th>Security    </th>
                        <th>Hack Time   </th>
                        <th>Current$/s  </th>
                        <th>Potential$/s</th>
                        <th>Notes       </th>
                        <th>RAM         </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedServers.map((server, index) => (
                        <tr key={server.hostname} className={server.hasRootAccess ? 'has-access' : 'no-access'}>
                            <td>{index + 1}</td>
                            <td>{server.hostname}</td>
                            <td>{ns.hasRootAccess(server.hostname) ? '✔' : '✖'}</td>
                            <td>{server.hackingLevel}/{server.requiredHackingLevel}</td>
                            <td>{server.portsRequired}</td>
                            <td>{server.currentMoney}/{server.maxMoney}</td>
                            <td>{server.moneyPercent}</td>
                            <td>{server.minSecurity}/{server.currentSecurity}</td>
                            <td>{server.hackTime}</td>
                            <td>{server.moneyPerHackTime}</td>
                            <td>{ns.formatNumber(ns.getServerMaxMoney(server.hostname) / ns.getHackTime(server.hostname), 2)}</td>
                            <td>{ns.formatNumber(1000000)}</td>
                            <td>{ns.formatNumber(ns.getServerMaxRam(server.hostname) - ns.getServerUsedRam(server.hostname), 2)}/{ns.formatNumber(ns.getServerMaxRam(server.hostname), 2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default ServerInfo;
export {
    ServerInfoProps,
    FormattedServerInfo
}