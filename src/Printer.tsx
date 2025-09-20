import type { NS } from "@ns";
import HackOS from './Ui/HackOS';
import * as HackHelpers from "/Hack/HackHelpers";
import React from "react";
export async function main(ns: NS) {
    const allServers = HackHelpers.ScanAllServers(ns);
    return new Promise<void>((resolve) => ns.tprintRaw(<HackOS servers={allServers.sorted} ns={ns} handle={{ close: () => resolve() }} />)).catch(ns.tprint)
}
