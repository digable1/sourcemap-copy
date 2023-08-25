import { getConfiguration } from "../sourcemap-copy";

export function isDirectoryExcluded(directoryParm: string): boolean {
    getConfiguration().excluded.forEach((excludedEntry) => {
        if (excludedEntry.startsWith(directoryParm)) {
            return true;
        }
    });
    return false;
}
