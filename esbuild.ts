import { type Plugin, context } from "esbuild"
import fg from "fast-glob"
// import fs from "node:fs"
import { syncStatic, syncTypeScript } from "./local/watch.js"
import path from "node:path"
import { fileURLToPath } from "node:url"
import fs from "node:fs"
const outDirectory = "dist"
// Copied from https://github.com/shyguy1412/esbuild-bitburner-plugin
export function reactPlugin(): Plugin {
    return {
        name: "ReactPlugin",
        setup(pluginBuild) {
            pluginBuild.onResolve({ filter: /^react(-dom)?$/ }, (opts) => {
                return {
                    namespace: 'react',
                    path: opts.path,
                }
            })
            pluginBuild.onLoad(
                { filter: /^react(-dom)?$/, namespace: 'react' },
                (opts) => {
                    if (opts.path == 'react') {
                        return {
                            contents: 'module.exports = React',
                        }
                    } else if (opts.path == 'react-dom') {
                        return {
                            contents: 'module.exports = ReactDOM',
                        }
                    }
                },
            )
        }
    }
}

// if (fs.existsSync(outDirectory)) {
//     fs.rmSync(outDirectory, { force: true, recursive: true })
// }
const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
console.log(__dirname)

// export function AliasResolve(): Plugin {
//     return {
//         name: "AliasResolve",
//         setup(pluginBuild) {
//             pluginBuild.onResolve({ filter: /^\// }, (opts) => {
//                 // resolve default resolve / to root of disk
//                 return {
//                     path: opts.path.slice(1),
//                     namespace: 'file'
//                 }
//             })
//             pluginBuild.onResolve({ filter: /^@ns$/ }, () => {
//                 return {
//                     path: "./NetscriptDefinitions.d.ts",
//                     namespace: 'file'
//                 }
//             })
//         }
//     }
// }

const ctx = await context({
    target: "esnext",
    entryPoints: fg.globSync(["./src/**/*"], {
        ignore: ["node_modules"]
    }),
    tsconfig: "tsconfig.HackOS.json",
    platform: "browser",
    format: "esm",
    plugins: [reactPlugin()],
    // plugins: [reactPlugin(), AliasResolve()],
    bundle: true,
    outbase: "./src",
    outdir: outDirectory,
    logLevel: "info",
    sourcemap: "inline",
    // treeShaking: true // true if bundle or format is iife
})
/* await */ ctx.watch() // Why the following will still run even if I awaited?
fs.rmSync("./tmp", { recursive: true, force: true })
console.log('Watching changes')
console.log('Start watching static and ts files...')
syncStatic()
syncTypeScript()
