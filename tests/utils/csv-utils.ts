import fs from "fs";
import { parse, ParseResult } from "papaparse";

export interface Test{
    testName: string,
    pricingPath: string,
    expected: string
}

export interface TestSection{
    sectionName: string,
    tests: Test[]
}

export function readCSVFile(filePath: string): Test[] {
    
    const absolutePath: string = fs.realpathSync(filePath);
    const csvContent = fs.readFileSync(absolutePath, "utf-8");
    const content = parse(csvContent,{header: true, skipEmptyLines: true, delimiter: ","}) as ParseResult<Test>;

    return content.data;

}

export function parseCSVContent(content: Test[]): TestSection[] {
    const result: TestSection[] = [];
    let i = -1; // In order to match the index 0 once the first test section is added
    for (const entry of content) {
        if (entry.pricingPath === "-") {
            result.push({
                sectionName: entry.testName,
                tests: []
            });
            i++;
            continue;
        }

        result[i].tests.push(entry);
    }

    return result;
}