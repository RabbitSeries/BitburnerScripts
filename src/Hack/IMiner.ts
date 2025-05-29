import { NS, RunOptions } from "@ns";
export interface IMinerArgs {
    hostName: string,
    scriptPath: string,
    targetName: string | null,
    threadOrOptions?: number | RunOptions
}

export type IMiner = {
    args: IMinerArgs,
    ns: NS,
    run: () => number,
};

export const IMinerPath = "Hack/IMiner.js"

export async function main(ns: NS) { }