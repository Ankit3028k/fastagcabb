import { readAllFilesFromDirectory, readAndParseFile } from './utils/fileReader.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFileReader() {
    console.log('🧪 Testing File Reader Functionality\n');
    
    try {
        // Test 1: Read all files from data directory
        console.log('📁 Test 1: Reading all files from data directory');
        const dataDirectory = path.join(__dirname, 'data');
        const result = await readAllFilesFromDirectory(dataDirectory);
        
        if (result.success !== false) {
            console.log('✅ Successfully read directory');
            console.log(`📊 Total files: ${result.totalFiles}`);
            console.log(`✅ Successfully parsed: ${result.successfullyParsed}`);
            console.log(`❌ Errors: ${result.errors}`);
            console.log(`📈 Summary:`, result.summary);
            
            // Show file details
            console.log('\n📄 File Details:');
            result.files.forEach(file => {
                console.log(`  - ${file.fileInfo.name} (${file.fileInfo.extension}) - ${file.success ? '✅' : '❌'}`);
                if (file.parseError) {
                    console.log(`    Error: ${file.parseError}`);
                }
            });
        } else {
            console.log('❌ Failed to read directory:', result.error);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test 2: Read specific files
        console.log('📄 Test 2: Reading specific files');
        
        const testFiles = ['users.json', 'products.csv', 'config.txt', 'orders.json', 'logs.txt'];
        
        for (const filename of testFiles) {
            console.log(`\n📖 Reading ${filename}:`);
            const filePath = path.join(dataDirectory, filename);
            const fileResult = await readAndParseFile(filePath);
            
            if (fileResult.success) {
                console.log(`✅ Successfully parsed ${filename}`);
                console.log(`📏 File size: ${fileResult.fileInfo.sizeInMB} MB`);
                console.log(`📅 Last modified: ${fileResult.fileInfo.modified}`);
                
                // Show sample data based on file type
                if (filename.endsWith('.json')) {
                    if (Array.isArray(fileResult.data)) {
                        console.log(`📊 Contains ${fileResult.data.length} items`);
                        if (fileResult.data.length > 0) {
                            console.log(`🔍 Sample item:`, JSON.stringify(fileResult.data[0], null, 2));
                        }
                    } else if (typeof fileResult.data === 'object') {
                        console.log(`🔍 Object keys:`, Object.keys(fileResult.data));
                    }
                } else if (filename.endsWith('.csv')) {
                    console.log(`📊 Contains ${fileResult.data.length} rows`);
                    if (fileResult.data.length > 0) {
                        console.log(`🔍 Columns:`, Object.keys(fileResult.data[0]));
                        console.log(`🔍 Sample row:`, fileResult.data[0]);
                    }
                } else if (filename.endsWith('.txt')) {
                    console.log(`📊 Contains ${fileResult.data.totalLines} lines`);
                    console.log(`🔍 Metadata:`, fileResult.data.metadata);
                    if (fileResult.data.content.length > 0) {
                        console.log(`🔍 First line:`, fileResult.data.content[0]);
                    }
                }
            } else {
                console.log(`❌ Failed to parse ${filename}:`, fileResult.parseError);
            }
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        console.log('🎉 All tests completed!');
        
    } catch (error) {
        console.error('💥 Test failed with error:', error);
    }
}

// Run the test
testFileReader();
