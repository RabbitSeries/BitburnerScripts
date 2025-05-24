import { NS } from "@ns";
import { IMiner, IMinerArgs, IMinerPath } from "./IMiner";
import { RegularMiner } from "./RegularMiner";
export default function MinerCreator(ns: NS, MinerArgs: IMinerArgs): IMiner {
    return {
        exec: () => {
            return ns.exec(IMinerPath, MinerArgs.hostname, MinerArgs.threadOrOptions);
        },
        Args: MinerArgs,
        ns: ns,
        ScriptPath: IMinerPath,
        HierachyPaths: [IMinerPath]
    }
}
