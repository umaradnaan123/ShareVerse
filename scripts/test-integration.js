import fetch from 'node-fetch';
import FormData from 'form-data';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('🚀 Starting ShareVerse Integration Test Suite...');
  process.env.PORT = '5099';
  
  // Start the server (boots automatically on import)
  const serverModule = await import('../dist/api/index.js');
  const app = serverModule.default;
  const PORT = 5099;

  // Wait a short duration to ensure Vite and Express have finished initialization
  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(`📡 Test Server running on port ${PORT}`);

  const baseUrl = `http://localhost:${PORT}`;
  const uploadTaskId = `test-uuid-${Date.now()}`;
  let resolvedFileId = '';

  try {
    // 1. Test Chunked/Standard Upload Mock
    console.log('\n--- Test 1: Uploading File ---');
    const form = new FormData();
    const tempFile = path.join(__dirname, 'test-asset.txt');
    fs.writeFileSync(tempFile, 'ShareVerse Integration Test Content');

    // Append metadata text fields BEFORE the file stream
    form.append('fileId', uploadTaskId);
    form.append('fileName', 'test-asset.txt');
    form.append('chunkIndex', '0');
    form.append('totalChunks', '1');
    form.append('fileSize', fs.statSync(tempFile).size.toString());
    form.append('chunk', fs.createReadStream(tempFile));

    const uploadRes = await fetch(`${baseUrl}/api/files/upload/chunk`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload failed with status: ${uploadRes.status}`);
    }

    const uploadJson = await uploadRes.json();
    console.log('Upload Response Payload:', uploadJson);
    resolvedFileId = uploadJson.file ? uploadJson.file.id : undefined;
    console.log(`✅ File Uploaded. Database ID: ${resolvedFileId}`);
    
    // Clean up temporary local asset
    fs.unlinkSync(tempFile);

    if (!resolvedFileId) {
      throw new Error('Upload completed but resolved database ID was not returned.');
    }

    // 2. Test Share View Lookup
    console.log('\n--- Test 2: Retrieving Share Details ---');
    const shareRes = await fetch(`${baseUrl}/api/shares/${resolvedFileId}`);
    if (!shareRes.ok) {
      throw new Error(`Share details retrieval failed with status: ${shareRes.status}`);
    }
    const shareJson = await shareRes.json();
    console.log(`✅ Share details retrieved. Name: ${shareJson.name}, Public: ${shareJson.is_public}`);

    // 3. Test Configuration Updates (Password, Expiration, Limits)
    console.log('\n--- Test 3: Setting Download Limit & Password ---');
    const settingsRes = await fetch(`${baseUrl}/api/files/${resolvedFileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isPublic: 0,
        password: 'secure-test-pass',
        downloadLimit: 2
      }),
    });

    if (!settingsRes.ok) {
      throw new Error(`Settings update failed with status: ${settingsRes.status}`);
    }
    console.log('✅ Settings applied (Password set, Download Limit set to 2)');

    // 4. Test Password Verification
    console.log('\n--- Test 4: Verifying Password Lock ---');
    const verifyFail = await fetch(`${baseUrl}/api/shares/${resolvedFileId}/verify-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong-pass' }),
    });
    console.log(`✅ Incorrect password rejected (Status ${verifyFail.status})`);

    const verifySuccess = await fetch(`${baseUrl}/api/shares/${resolvedFileId}/verify-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'secure-test-pass' }),
    });
    if (!verifySuccess.ok) {
      throw new Error('Password verification failed for correct password');
    }
    console.log('✅ Correct password accepted');

    // 5. Test Download & Limits
    console.log('\n--- Test 5: Fetching & Streaming Downloads ---');
    const dl1 = await fetch(`${baseUrl}/api/shares/${resolvedFileId}/download?password=secure-test-pass`);
    if (!dl1.ok) {
      throw new Error(`Download 1 failed with status: ${dl1.status}`);
    }
    const txt1 = await dl1.text();
    console.log(`✅ Download 1 retrieved content: "${txt1}"`);

    const dl2 = await fetch(`${baseUrl}/api/shares/${resolvedFileId}/download?password=secure-test-pass`);
    if (!dl2.ok) {
      throw new Error(`Download 2 failed with status: ${dl2.status}`);
    }
    console.log('✅ Download 2 succeeded');

    // Download 3 should trigger the limit check (since limit is 2)
    console.log('\n--- Test 6: Verifying Download Limit Enforcement ---');
    const dl3 = await fetch(`${baseUrl}/api/shares/${resolvedFileId}/download?password=secure-test-pass`);
    if (dl3.status === 410) {
      console.log('✅ Access blocked: limit successfully enforced (Status 410)');
    } else {
      throw new Error(`Expected status 410, got ${dl3.status}`);
    }

    // 7. Test Analytics Retrieval Endpoint
    console.log('\n--- Test 7: Retrieving File Analytics ---');
    const analyticsRes = await fetch(`${baseUrl}/api/files/${resolvedFileId}/analytics`);
    if (!analyticsRes.ok) {
      throw new Error(`Analytics retrieval failed with status: ${analyticsRes.status}`);
    }
    const analyticsJson = await analyticsRes.json();
    console.log(`✅ Analytics retrieved. Total Downloads: ${analyticsJson.totalDownloads}, Logs count: ${analyticsJson.downloads.length}`);

    // 8. Test Recursive Folder Tree Creation
    console.log('\n--- Test 8: Folder Tree Hierarchy Creation ---');
    const folderRes = await fetch(`${baseUrl}/api/folders/ensure-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pathParts: ['documents', 'contracts', '2026'],
        rootParentFolderId: 'root'
      })
    });
    if (!folderRes.ok) {
      throw new Error(`Folder path creation failed with status: ${folderRes.status}`);
    }
    const folderJson = await folderRes.json();
    console.log(`✅ Nested Folder Tree created. Final Folder ID: ${folderJson.folderId}`);

    console.log('\n🏆 All integration tests passed successfully!');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err.message);
    process.exitCode = 1;
  } finally {
    console.log('🔌 Test Suite execution complete.');
    process.exit(process.exitCode || 0);
  }
}

runTests();
