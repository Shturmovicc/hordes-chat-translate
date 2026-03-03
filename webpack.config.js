const path = require("node:path")
const { UserscriptPlugin } = require("webpack-userscript")

const pkg = require("./package.json")

const baseConfig = {
    entry: "./src/script.js",
    output: {
        path: path.resolve(__dirname, "dist"),
    },
}

module.exports = [
    {
        ...baseConfig,
        output: {
            ...baseConfig.output,
            filename: `${pkg.name}-v${pkg.version}.js`,
        },
    },
    {
        ...baseConfig,
        output: {
            ...baseConfig.output,
            filename: `${pkg.name}-v${pkg.version}.user.js`,
        },
        plugins: [
            new UserscriptPlugin({
                headers: {
                    name: "Hordes.io - Chat Translation Mod",
                    match: "https://hordes.io/play",
                    grant: "GM.xmlHttpRequest",
                    connect: "translate.google.com",
                    version: pkg.version,
                    author: pkg.author,
                    description: "Automatically translates chat",
                    "run-at": "document-start",
                },
            }),
        ],
    },
]
module.exports.parallelism = 2
