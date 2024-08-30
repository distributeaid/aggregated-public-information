import "dotenv/config";
import { readFileSync } from 'fs';
import { join } from 'path';

import { consolidateRegions, parseRegion, getRegion, uploadRegion } from "./add-regions";
import { UploadWorkflowStatus } from "./types.d";


async function main() {
    try {

        //  Load the json data
        const jsonData = readFileSync(join(__dirname, './needs-data.json'), 'utf8');
        const data = JSON.parse(jsonData);

        //  Process the regions
        const regions = consolidateRegions(data);  /** checks this function is working  */
        // console.log('Processed Regions', regions);

        // Run getRegion for each consolidated region - to check this function is working
        for (const regionName of regions) {
            try {
                const workflow = await getRegion({
                    data: {region: regionName },
                    orig: regionName,
                    status: 'PROCESSING',
                    logs: []
                });

                console.log(`Result for region ${regionName}:`, workflow);

                if (workflow.status !== UploadWorkflowStatus.ALREADY_EXISTS) {
                    try {
                        const uploadedRegion = await uploadRegion(workflow);
                        console.log(`Uploaded region ${workflow.orig}:`, uploadedRegion);
                    } catch (error) {
                        console.error(`Error uploading region ${workflow.orig}:`, error);
                    }
                }
            } catch (error) {
                console.error(`Error processing region ${regionName}:`, error);
            }
        }

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