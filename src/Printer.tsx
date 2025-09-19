import type { NS } from "@ns";
import HackOS from '/Ui/HackOS';
import * as HackHelpers from "/Hack/HackHelpers";
import React from "react";
export async function main(ns: NS): Promise<void> {
    const allServers = HackHelpers.ScanAllServers(ns);
    let status = true
    ns.tprintRaw(<HackOS servers={allServers.sorted} ns={ns} handle={{ close: () => status = false }} />);
    while (status) {
        await ns.asleep(1000);
    }
}
