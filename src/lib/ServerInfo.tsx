import type { NS } from '@ns';
import React from './react';
interface ServerInfoProps {
    data: {
        hasRootAccess: boolean;
        hackingLevel: number;
        requiredHackingLevel: number;
        portsRequired: number;
        currentMoney: number;
        maxMoney: number;
        hackTime: number;
        growTime: number;
        weakenTime: number;
        minSecurity: number;
        currentSecurity: number;
    };
    CurrentHost: string;
}
const ServerInfo = ({ data, CurrentHost }: ServerInfoProps) => {
    return (
        <div className="server-info-container">
            <h2 className="server-title">{CurrentHost} Server Information</h2>

            <div className="server-info-grid">
                {/* Access Section */}
                <div className="info-section access-section">
                    <h3>Access</h3>
                    <div className={`access-status ${data.hasRootAccess ? 'granted' : 'denied'}`}>
                        Root Access: {data.hasRootAccess ? '✔ Granted' : '✖ Denied'}
                    </div>
                    <div className="info-item">
                        <span className="label">Your Hacking Level:</span>
                        <span className="value">{data.hackingLevel}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Required Level:</span>
                        <span className="value">{data.requiredHackingLevel}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Ports Required:</span>
                        <span className="value">{data.portsRequired}</span>
                    </div>
                </div>

                {/* Money Section */}
                <div className="info-section money-section">
                    <h3>Money</h3>
                    <div className="info-item">
                        <span className="label">Current Money:</span>
                        <span className="value">{data.currentMoney}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Max Money:</span>
                        <span className="value">{data.maxMoney}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Money Filled:</span>
                        <span className="value">{data.maxMoney > 0 ? ((data.currentMoney / data.maxMoney) * 100).toFixed(2) + '%' : 'N/A'}</span>
                    </div>
                </div>

                {/* Security Section */}
                <div className="info-section security-section">
                    <h3>Security</h3>
                    <div className="info-item">
                        <span className="label">Min Security:</span>
                        <span className="value">{data.minSecurity}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Current Security:</span>
                        <span className="value">{data.minSecurity}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Security Difference:</span>
                        <span className="value">+{(data.currentSecurity - data.minSecurity).toFixed(2)}</span>
                    </div>
                </div>

                {/* Timing Section */}
                <div className="info-section timing-section">
                    <h3>Operation Times</h3>
                    <div className="info-item">
                        <span className="label">Hack Time:</span>
                        <span className="value">{data.hackTime}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Grow Time:</span>
                        <span className="value">{data.growTime}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Weaken Time:</span>
                        <span className="value">{data.weakenTime}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServerInfo;
