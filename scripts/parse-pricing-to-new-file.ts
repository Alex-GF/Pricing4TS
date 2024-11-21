import { retrievePricingFromPath, writePricingToYaml } from "../src/main";
import * as fs from 'fs';
import * as path from 'path';

const result_path = "./test/";

const resolved_result_path = path.resolve(result_path);
const yamlPath = process.argv[2];

const ensureDirectoryExistence = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        return true;
    }
    fs.mkdirSync(filePath, { recursive: true });
};

const main = () => {

    const pricing = retrievePricingFromPath(yamlPath);

    const outputFilePath = path.join(resolved_result_path, 'pricing.yml');
    fs.writeFileSync(outputFilePath, '');
    writePricingToYaml(pricing, outputFilePath);
}

ensureDirectoryExistence(result_path);
main();