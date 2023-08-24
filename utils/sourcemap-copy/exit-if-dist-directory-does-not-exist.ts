import * as fs from 'fs';

export function exitIfDistDirectoryDoesNotExist(directory: string): void {
    if (!fs.existsSync(directory)) {
        console.error(`Package directory '${directory}' does not exist - ensure it's built before running this tool`);
        process.exit(1);
    }
}
