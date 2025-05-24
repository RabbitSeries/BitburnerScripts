import { NS, RunOptions } from "@ns";
interface IMinerArgs {
    hostname: string,
    targetname: string | null,
    threadOrOptions?: number | RunOptions
}

type IMiner = {
    Args: IMinerArgs,
    ns: NS,
    ScriptPath: string
    HierachyPaths: string[],
    exec: () => number,
};

const IMinerPath = 'Hack/IMiner.js'

export function scp(ns: NS, miner: IMiner, destination: string): void {
    ns.scp(miner.ScriptPath, destination);
}

export async function main(ns: NS) { }
export { IMiner, IMinerArgs, IMinerPath }