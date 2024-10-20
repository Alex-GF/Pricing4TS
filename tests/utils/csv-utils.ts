import * as csv from "@std/csv";

export interface Test{
    testName: string,
    pricingPath: string,
    expected: string
}

export interface TestSection{
    sectionName: string,
    tests: Test[]
}

export function readCSVFile(filePath: string): string[][] {
    
    const absolutePath: string = Deno.realPathSync(filePath);
    const csvContent = Deno.readTextFileSync(absolutePath);
    const content: string[][] = csv.parse(csvContent.split('\n').slice(1).join('\n'));

    return content;

}

export function parseCSVContent(content: string[][]): TestSection[] {
    const result: TestSection[] = [];
    let i = -1; // In order to match the index 0 once the first test section is added
    for (const entry of content) {
        if (entry[1] === "-") {
            result.push({
                sectionName: entry[0],
                tests: []
            });
            i++;
            continue;
        }

        result[i].tests.push({
            testName: entry[0],
            pricingPath: entry[1],
            expected: entry[2]
        });
    }

    return result;
}