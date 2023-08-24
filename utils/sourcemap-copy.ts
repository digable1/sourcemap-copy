import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'ts-command-line-args';
import { changeMapSourcesPath } from './sourcemap-copy/change-map-sources-path';
import { findMapFiles } from './sourcemap-copy/find-map-files';
import { copySources} from './sourcemap-copy/copy-sources';
import { readConfiguration } from './sourcemap-copy/read-configuration';
import { SourcemapCopyConfiguration } from './sourcemap-copy/schemas/sourcemap-copy-configuration';
import { SourcemapCopyParameters } from './sourcemap-copy/schemas/sourcemap-copy-parameters';

export const configurationFile = './sourcemap-copy.json';
export const parentPath = '../';

export const sourcemapCopyParameters = parse<SourcemapCopyParameters>({
    quiet: { type: Boolean, optional: true, alias: 'q', description: 'Suppresses status/log messages' },
    help: { type: Boolean, optional: true, alias: 'h', description: 'Help' }
},
{
    helpArg: 'help',
    headerContentSections: [{ header: 'Sourcemap Copy', content: 'Command to copy source files to \'dest\' location for use cases where original locations get in the way'}],
    footerContentSections: [{ header: '(c) digable1', content: 'Open Source License (TBD - likely Apache 2' }]
});


export let configuration: SourcemapCopyConfiguration;

export function copySourcemap(): void {
    const cwd = process.cwd();
    configuration = readConfiguration();
    if (cwd.indexOf(configuration.utilsDirectory) < 0) {
        console.error(`This must be run in the ${configuration.utilsDirectory} directory`);
        process.exit(1);
    }
    process.chdir(path.resolve(configuration.utilsToRoot));
    const originalDirectory = process.cwd();

    if (!sourcemapCopyParameters.quiet) {
        console.log(`Syncing sourcemaps:`);
        console.log(`    Original directory  : ${originalDirectory}`);
        console.log(`    Desination directory: ${originalDirectory}${configuration.rootToDistSrc}`);
        console.log();
    }

    findMapFiles().forEach((dirEntry) => {
        const mapObject = changeMapSourcesPath(`${dirEntry.name}`);
        copySources(mapObject);
        fs.writeFileSync(`${dirEntry.name}`, JSON.stringify(mapObject), { encoding: 'utf-8' });
    });
    process.chdir(cwd);
    if (!sourcemapCopyParameters.quiet) {
        console.log();
        console.log(`Done`);
        console.log();
    }
}

copySourcemap();
