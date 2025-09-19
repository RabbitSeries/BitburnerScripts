import type { NS, RunOptions } from "@ns"
export interface IMinerArgs {
    hostName: string,
    targetName: string | null,
    threadOrOptions?: number | RunOptions
}

export interface IMiner {
    args: IMinerArgs
    ns: NS
    scriptPath: string
    run: () => number
}

export const IMinerPath = "Hack/IMiner.js"

export async function main(ns: NS) { ns }