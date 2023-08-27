import { existsSyncImpl } from './fs-impl';

export function exitIfDistDirectoryDoesNotExist(directory: string): void {
    if (!existsSyncImpl(directory)) {
        console.error(`Package directory '${directory}' does not exist - ensure it's built before running this tool`);
        process.exit(1);
    }
}
