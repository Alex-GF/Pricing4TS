// ex. scripts/build_npm.ts
import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/main.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  typeCheck: false,
  test: false,
  package: {
    // package.json properties
    name: "pricing4ts",
    version: Deno.args[0],
    description: "Pricing4TS is a TypeScript-based toolkit designed to enhance the server-side functionality of a pricing-driven SaaS by enabling the seamless integration of pricing plans into the application logic. The package provides a suite of components that are predicated on the Pricing2Yaml syntax, a specification that facilitates the definition of system's pricing and its features alongside their respective evaluation expressions, grouping them within plans and add-ons, as well as establishing usage limits.",
    license: "MIT",
    repository: {
      type: "git",
      url: "https://github.com/Alex-GF/Pricing4TS",
    },
    bugs: {
      url: "https://github.com/Alex-GF/Pricing4TS",
    },
    dependencies: {
      "@types/assert": "^1.5.10",
      "@types/semver": "^7.5.8",
      "@types/js-yaml": "^4.0.9",
      "@types/uuid": "^10.0.0",
      "assert": "^2.1.0",
      "jest": "^29.7.0",
      "js-yaml": "^4.1.0",
      "semver": "^7.6.3",
      "uuid": "^10.0.0",
    }
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});