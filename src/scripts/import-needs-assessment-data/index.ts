import "dotenv/config";
import { readFileSync } from 'fs';
import { join } from 'path';

import { consolidateRegions } from "./add-regions.ts";


async function main() {
    try {

        //  Load the json data
        const jsonData = readFileSync(join(__dirname, './needs-data.json'), 'utf8');
        const data = JSON.parse(jsonData);

        //  Process the regions
        const regions = consolidateRegions(data);

        console.log('Processed Regions', regions);

    } catch (error) {
        // console.error('Error processing regions', error);
        if (error.code === 'ENOENT') {
            console.error(`File not found: ${error.path}`);
        } else if (error instanceof SyntaxError) {
            console.error('JSON parsing error:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
 }

main();