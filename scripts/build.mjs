import { build, context } from "esbuild";
import fs from "node:fs";
import path from "node:path";

const pkg = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")
);

const dependencies = Object.keys(pkg.dependencies ?? {});
const peerDependencies = Object.keys(pkg.peerDependencies ?? {});

const esm = ["find-up"];

const external = [...dependencies, ...peerDependencies].filter(
  (dep) => !esm.includes(dep)
);

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ["./src/index.ts"],
  minify: true,
  bundle: true,
  outfile: "./lib/index.js",
  target: "node14.11",
  platform: "node",
  format: "cjs",
  external,
};

if (process.env.WATCH === "true") {
  context({
    plugins: [
      {
        name: "on-end",
        setup(build) {
          build.onEnd((error, result) => {
            if (error) {
              console.error("watch build failed:", error);
            } else {
              console.log("watch build succeeded:", result);
            }
          });
        },
      },
    ],
  });
}

build(options).catch((err) => {
  process.stderr.write(err.stderr);
  process.exit(1);
});
