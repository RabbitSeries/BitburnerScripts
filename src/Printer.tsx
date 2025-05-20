import React from './lib/react';
import ServerInfo from "./lib/ServerInfo";
import type { NS } from "@ns";
export async function main(ns: NS): Promise<void> {
  const target = 'joesguns';
  const serverData = {
    hasRootAccess: ns.hasRootAccess(target),
    hackingLevel: ns.getHackingLevel(),
    requiredHackingLevel: ns.getServerRequiredHackingLevel(target),
    portsRequired: ns.getServerNumPortsRequired(target),
    currentMoney: ns.getServerMoneyAvailable(target),
    maxMoney: ns.getServerMaxMoney(target),
    hackTime: ns.getHackTime(target),
    growTime: ns.getGrowTime(target),
    weakenTime: ns.getWeakenTime(target),
    minSecurity: ns.getServerMinSecurityLevel(target),
    currentSecurity: ns.getServerSecurityLevel(target),
  };
  ns.clearLog();
  ns.tprintRaw(<ServerInfo data={serverData} CurrentHost={target} />);
  await ns.sleep(1000);
  ns.tprint("Script completed");
}
