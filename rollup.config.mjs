import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const config = {
  input: "build/index.js",
  output: {
    esModule: true,
    file: "dist/index.js",
    format: "es",
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      preferBuiltins: true, 
      // look specifically for these keys in the package.json "exports" object.
      exportConditions: ["node", "import"]
    }),
    commonjs()
  ]
};

export default config;
