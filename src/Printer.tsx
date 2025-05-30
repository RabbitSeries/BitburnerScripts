import React from "lib/react";
import type { NS } from "@ns";
import HackOS from '/Ui/HackOS';
import * as HackHelpers from "./Hack/HackHelpers";
export async function main(ns: NS): Promise<void> {
    const allServers = HackHelpers.ScanAllServers(ns);
    ns.tprintRaw(<HackOS servers={allServers.sorted} ns={ns} />);
    while (true) {
        await ns.asleep(1000);
    }
}
