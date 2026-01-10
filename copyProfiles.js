const fs = require('fs');
const path = require('path');

// Source folder
const sourceFolder = 'acc7nobb';

// Files to copy
const filesToCopy = ['building.ini', 'config.ini', 'stats_buildings.ini'];

// Target folders (acc1nobb to acc14nobb, excluding acc7nobb)
const targetFolders = [];
for (let i = 1; i <= 14; i++) {
    if (i !== 7) { // Skip acc7nobb as it's the source
        targetFolders.push(`acc${i}nobb`);
    }
}

function copyFiles() {
    console.log(`Starting to copy files from ${sourceFolder}...`);

    let successCount = 0;
    let errorCount = 0;

    targetFolders.forEach(targetFolder => {
        console.log(`\nCopying to ${targetFolder}...`);

        filesToCopy.forEach(file => {
            const sourcePath = path.join(__dirname, sourceFolder, file);
            const targetPath = path.join(__dirname, targetFolder, file);

            try {
                // Check if source file exists
                if (!fs.existsSync(sourcePath)) {
                    console.log(`  ⚠ Source file not found: ${sourcePath}`);
                    errorCount++;
                    return;
                }

                // Check if target folder exists
                if (!fs.existsSync(path.join(__dirname, targetFolder))) {
                    console.log(`  ⚠ Target folder not found: ${targetFolder}`);
                    errorCount++;
                    return;
                }

                // Copy the file
                fs.copyFileSync(sourcePath, targetPath);
                console.log(`  ✓ Copied ${file}`);
                successCount++;
            } catch (error) {
                console.log(`  ✗ Error copying ${file}: ${error.message}`);
                errorCount++;
            }
        });
    });

    console.log(`\n===== Summary =====`);
    console.log(`Successfully copied: ${successCount} files`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total operations: ${successCount + errorCount}`);
}

// Run the function
copyFiles();
