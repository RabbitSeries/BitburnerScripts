import { NS } from "@ns";
import { IMiner, IMinerArgs } from "./IMiner";
import { RegularMiner } from "./RegularMiner";
import { TryHacking } from "./HackHelpers";
export default function MinerCreator(ns: NS, MinerArgs: IMinerArgs): IMiner {
    return {
        args: MinerArgs,
        run: function () {
            return TryHacking(ns, this);
        },
        ns: ns
    }
}
