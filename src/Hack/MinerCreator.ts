import { NS } from "@ns";
import { IMiner, IMinerArgs } from "./IMiner";
import { RegularMiner } from "./RegularMiner";
export default function MinerCreator(ns: NS, MinerArgs: IMinerArgs): IMiner {
    return {
        run: () => {
            return ns.exec(MinerArgs.scriptPath, MinerArgs.hostName, MinerArgs.threadOrOptions);
        },
        args: MinerArgs,
        ns: ns
    }
}
