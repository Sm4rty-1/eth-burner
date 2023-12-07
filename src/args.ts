const cmdArgs = require("command-line-args");

type Args = {
    privateKey: string,
    bloxAuth: string, 
    beerFund?: string,
};

const optionDefinitions = [
    { name: "private-key", alias: "k", type: String },
    { name: "beer-fund", alias: "b", type: String, defaultOption: true }
];
const options = cmdArgs(optionDefinitions);

// ensure all options are set
for (const o of optionDefinitions) {
    if (!options[o.name] && !o.defaultOption) {
        console.error(`Missing argument --${o.name}`);
        process.exit(1);
    }
}

const args: Args = {
    privateKey: options["private-key"],
    beerFund: options["beer-fund"] || "0xfb000000387627910184cc42fc92995913806333",
};

export default args;
