import * as fs from 'fs';
import { SourcemapCopyConfiguration } from './schemas/sourcemap-copy-configuration';

const configurationFile = './sourcemap-copy.json';

export function readConfiguration(file = configurationFile): SourcemapCopyConfiguration {
    try {
        return JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' })) as SourcemapCopyConfiguration;
    } catch(e) {
        console.error(`Could not find configuration file '${file}'`);
        console.error(`    Are you in the same directory as this configuration file?`);
        process.exit(1);
    }
}
