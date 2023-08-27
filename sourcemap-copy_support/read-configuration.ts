import { readFileSyncImpl } from './fs-impl';
import { SourcemapCopyConfiguration } from './schemas/sourcemap-copy-configuration';

const toolname = 'sourcemap-copy';
const jsonFile = `${toolname}.json`

const rootdirConfigurationFile = `../../${jsonFile}`
const toolbinConfigurationFile = `../${toolname}/${jsonFile}`;
const currentDirectoryConfigurationFile = `./${jsonFile}`;

export function readConfiguration(file = rootdirConfigurationFile): SourcemapCopyConfiguration {
    const configurationFiles: Array<string> = [
        rootdirConfigurationFile,
        toolbinConfigurationFile,
        currentDirectoryConfigurationFile
    ]
    const filesTried: Array<string> = [];

    let myE: Array<unknown> = []
    try {
        return JSON.parse(readFileSyncImpl(file, { encoding: 'utf-8' })) as SourcemapCopyConfiguration;
    } catch(e) {
        filesTried.push(file);
        myE.push(e);
    }
    for (const configurationFile of configurationFiles) {
        if (configurationFile !== file) {
            try {
                return JSON.parse(readFileSyncImpl(configurationFile, { encoding: 'utf-8' })) as SourcemapCopyConfiguration;
            } catch(e) {
                filesTried.push(configurationFile);
                myE.push(e);
            }
        }
    }
    console.error(`Could not find configuration file, tried: ${filesTried.join(', ')}`);
    console.error(`    Are you in the same directory as one of the configuration files?`);
    console.error();
    console.error('Errors:', myE.join(', '));
    process.exit(1);
}
