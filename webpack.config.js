const path = require("node:path")

module.exports = {
    entry: "./src/script.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "index.js",
    },
    mode: "production",
}
