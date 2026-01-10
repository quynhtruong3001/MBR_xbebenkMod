const fs = require('fs');
const path = require('path');

/**
 * Clears temporary files from profile folders
 * Scans acc1nobb to acc14nobb folders and deletes all files in:
 * - Donate
 * - Logs
 * - Loots
 * - Temp
 *
 * Preserves config files: building.ini, config.ini, stats_buildings.ini
 */
function clearProfileTempFiles() {
    const baseDir = path.join(__dirname);
    const foldersToClean = ['Donate', 'Logs', 'Loots', 'Temp'];
    const configFiles = ['building.ini', 'config.ini', 'stats_buildings.ini'];

    const results = {
        profiles: [],
        summary: {
            totalDeleted: 0,
            totalErrors: 0,
            totalSize: 0
        }
    };

    // Scan for profile folders (acc1nobb to acc14nobb)
    for (let i = 1; i <= 14; i++) {
        const profileName = `acc${i}nobb`;
        const profilePath = path.join(baseDir, profileName);

        // Check if profile folder exists
        if (!fs.existsSync(profilePath)) {
            console.log(`⊘ Profile folder not found: ${profileName}`);
            continue;
        }

        console.log(`\n📁 Processing profile: ${profileName}`);
        const profileResult = {
            name: profileName,
            folders: [],
            deleted: 0,
            errors: 0,
            size: 0
        };

        // Clean each subfolder
        foldersToClean.forEach(folderName => {
            const folderPath = path.join(profilePath, folderName);

            if (!fs.existsSync(folderPath)) {
                console.log(`  ⊘ Folder not found: ${folderName}`);
                return;
            }

            console.log(`  📂 Cleaning: ${folderName}`);
            const folderResult = cleanFolder(folderPath, configFiles);

            profileResult.folders.push({
                name: folderName,
                deleted: folderResult.deleted,
                errors: folderResult.errors,
                size: folderResult.size
            });

            profileResult.deleted += folderResult.deleted;
            profileResult.errors += folderResult.errors;
            profileResult.size += folderResult.size;

            console.log(`    ✓ Deleted ${folderResult.deleted} file(s) (${formatSize(folderResult.size)})`);
            if (folderResult.errors > 0) {
                console.log(`    ⚠ Errors: ${folderResult.errors}`);
            }
        });

        results.profiles.push(profileResult);
        results.summary.totalDeleted += profileResult.deleted;
        results.summary.totalErrors += profileResult.errors;
        results.summary.totalSize += profileResult.size;
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total profiles processed: ${results.profiles.length}`);
    console.log(`Total files deleted: ${results.summary.totalDeleted}`);
    console.log(`Total space freed: ${formatSize(results.summary.totalSize)}`);
    if (results.summary.totalErrors > 0) {
        console.log(`Total errors: ${results.summary.totalErrors}`);
    }
    console.log('='.repeat(60));

    return results;
}

/**
 * Recursively clean a folder and its subfolders
 * @param {string} folderPath - Path to the folder to clean
 * @param {string[]} protectedFiles - List of files to NOT delete
 * @returns {object} - Statistics about deleted files
 */
function cleanFolder(folderPath, protectedFiles = []) {
    const stats = {
        deleted: 0,
        errors: 0,
        size: 0
    };

    try {
        const items = fs.readdirSync(folderPath);

        items.forEach(item => {
            const itemPath = path.join(folderPath, item);

            try {
                const stat = fs.statSync(itemPath);

                if (stat.isDirectory()) {
                    // Recursively clean subdirectories
                    const subStats = cleanFolder(itemPath, protectedFiles);
                    stats.deleted += subStats.deleted;
                    stats.errors += subStats.errors;
                    stats.size += subStats.size;

                    // Try to remove empty directory
                    try {
                        fs.rmdirSync(itemPath);
                    } catch (err) {
                        // Directory not empty or can't be deleted, that's okay
                    }
                } else if (stat.isFile()) {
                    // Check if file is protected (config file)
                    if (protectedFiles.includes(item)) {
                        console.log(`    🔒 Protected: ${item}`);
                        return;
                    }

                    // Delete the file
                    const fileSize = stat.size;
                    fs.unlinkSync(itemPath);
                    stats.deleted++;
                    stats.size += fileSize;
                }
            } catch (err) {
                console.error(`    ✗ Error processing ${item}: ${err.message}`);
                stats.errors++;
            }
        });
    } catch (err) {
        console.error(`  ✗ Error reading folder ${folderPath}: ${err.message}`);
        stats.errors++;
    }

    return stats;
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

// Run the function if this script is executed directly
if (require.main === module) {
    console.log('🧹 Starting cleanup of profile temporary files...\n');
    clearProfileTempFiles();
}

// Export for use in other modules
module.exports = {
    clearProfileTempFiles,
    cleanFolder,
    formatSize
};
