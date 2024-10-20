# Pricing4TS

![NPM Version](https://img.shields.io/npm/v/pricing4ts)

Pricing4TS is a TypeScript-based toolkit designed to enhance the server-side functionality of a pricing-driven SaaS by enabling the seamless integration of pricing plans into the application logic. The package provides a suite of components that are predicated on the Pricing2Yaml syntax, a specification that facilitates the definition of system's pricing and its features alongside their respective evaluation expressions, grouping them within plans and add-ons, as well as establishing usage limits.

Pricing4TS has been designed to be used with [Pricing4React](https://github.com/isa-group/Pricing4React), a frontend library that consumes the generated JWT and toggles on and off features based on the user pricing plan.

For detailed information on how to get started with Pricing4TS, advanced configurations, and integration guides, please visit our [official documentation website](https://pricing4saas-docs.vercel.app).

## Installation

```bash
npm i pricing4ts
```
or
```bash
yarn add pricing4ts
```
or
```bash
deno add npm:pricing4ts
```

## Key Components
As the library is still under development, it only allows to parse a Pricing2Yaml file into a Pricing object and vice versa, using the methods: `retrievePricingFromYaml` and `writePricingToYaml` respectively.

## Contributions

This project is part of the research activities of the [ISA Group](https://www.isa.us.es/3.0/). It is still under development and should be used with caution. We are not responsible for any damage caused by the use of this software. If you find any bugs or have any suggestions, please let us know by opening an issue in the [GitHub repository](https://github.com/Alex-GF/Pricing4TS/issues).
