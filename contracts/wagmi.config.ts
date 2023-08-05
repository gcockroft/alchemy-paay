import {defineConfig} from "@wagmi/cli";
import {foundry} from "@wagmi/cli/plugins";

export default defineConfig({
  out: "../shared/src/abi.ts",
  plugins: [
    foundry({
      project: ".",
    }),
  ],
});
