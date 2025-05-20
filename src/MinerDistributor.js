/** @param {NS} ns */
export async function main(ns) {
    let ScriptName = "";
    if (ns.args.length === 1 && typeof ns.args[0] === "string") {
        ScriptName = ns.args[0];
        if (!ns.fileExists(ScriptName, "home")) {
            ns.tprint(`Script does not exist, exiting.`);
            ns.exit();
        }
    } else {
        ns.tprint(`Script is not specified, exiting.`);
        ns.exit();
    }

    let Queue = [];
    let Visited = new Set();
    Queue.push("home");
    Visited.add("home");

    const Target = BFSNuke(ns);
    ns.tprint(`RichestNeighbor: ${Target} with possible revenue ${ns.getServerMoneyAvailable(Target)}`);

    while (Queue.length > 0) {
        const CurrentHost = Queue.shift();
        if (CurrentHost !== "home") {
            if (ns.hasRootAccess(CurrentHost)) {
                TryHacking(ns, ScriptName, CurrentHost, "silver-helix");
            } else {
                const m = ns.getScriptRam(ScriptName),
                    U = ns.getServerUsedRam(CurrentHost),
                    M = ns.getServerMaxRam(CurrentHost),
                    R = ns.getServerMaxRam(CurrentHost) - ns.getServerUsedRam(CurrentHost);
                ns.tprint(`WARN:\t Failed to run scipt on traget ${cyanStr(CurrentHost)}, skipping`)
                ns.tprint(`INFO:\t\t HashRootAccess: ${ns.hasRootAccess(CurrentHost)}`);
                ns.tprint(`INFO:\t\t Required mem usage: ${m}(m)/${U}(U)/${M}(M)/${R}(R)/`);
                ns.tprint(`INFO:\t\t Required hack level: ${ns.getHackingLevel()}/${ns.getServerRequiredHackingLevel(CurrentHost)}`);
                ns.tprint(`INFO:\t\t Required open ports: ${ns.getServerNumPortsRequired(CurrentHost)}`);
            }
        }
        for (const Neighbor of ns.scan(CurrentHost)) {
            if (!Visited.has(Neighbor)) {
                Visited.add(Neighbor);
                Queue.push(Neighbor);
            }
        }
    }
}

function cyanStr(str) {
    return `\u001b[36m${str}\u001b[0m`;
}

/** @param {NS} ns */
function TryHacking(ns, ScriptName, CurrentHost, Target) {
    ns.scp(ScriptName, CurrentHost, "home");
    const ScriptRam = ns.getScriptRam(ScriptName, CurrentHost);
    try {
        const MaxThreads = Math.floor(ns.getServerMaxRam(CurrentHost) / ScriptRam);
        if (MaxThreads > 0) {
            ns.killall(CurrentHost);
            if (Target !== null) {
                if (ns.exec(ScriptName, CurrentHost, MaxThreads, Target)) {
                    ns.tprint(`SUCCESS: running ${ScriptName} on ${CurrentHost} hacking ${Target} in ${MaxThreads} threads)`);
                }
            }
        }
    } catch (error) {
        ns.tprint(`ERROR: Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/** @param {NS} ns */
function TryNuke(ns, Target) {
    if (!ns.hasRootAccess(Target)) {
        try {
            try {
                ns.brutessh(Target);
            } catch (error) { }
            try {
                ns.ftpcrack(Target);
            } catch (error) { }
            try {
                ns.httpworm(Target);
            } catch (error) { }
            try {
                ns.sqlinject(Target);
            } catch (error) { }
            ns.nuke(Target);
        } catch (error) {
            return ns.hasRootAccess(Target);
        }
    }
    return ns.hasRootAccess(Target);
}

/** @param {NS} ns */
function BFSNuke(ns) {
    let Queue = [];
    let Visited = new Set();
    Queue.push("home");
    Visited.add("home");
    let RichestNeighbor = null;
    while (Queue.length > 0) {
        const Target = Queue.shift();
        for (const h of ns.scan(Target)) {
            if (!Visited.has(h)) {
                Visited.add(h);
                Queue.push(h);
                if (TryNuke(ns, h)) {
                    if (h !== "home" && !h.startsWith("pserv-") && (RichestNeighbor === null || ns.getServerMoneyAvailable(h) > ns.getServerMoneyAvailable(RichestNeighbor))) {
                        RichestNeighbor = h;
                    }
                }
            }
        }
    }
    return RichestNeighbor;
}