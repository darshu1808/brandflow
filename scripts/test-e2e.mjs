// BrandFlow End-to-End Automated Test Verification Script
// Tests all 12 critical test scenarios from Section 27

const PORT = process.env.PORT || '3000';
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('🚀 Starting BrandFlow End-to-End Automated Verification...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Initial Data Hydration
  await test('Test 0: Data Hydration & Server Status', async () => {
    const res = await fetch(`${BASE_URL}/api/data`);
    const json = await res.json();
    if (!json.success || !json.data) throw new Error('Data endpoint failed');
    if (json.data.brands.length < 5) throw new Error('Expected at least 5 brands');
    if (json.data.tasks.length < 5) throw new Error('Expected at least 5 initial tasks');
  });

  // 2. Test 1: Brand Creation & Assignment
  let createdBrandId = '';
  await test('Test 1: Brand Creation & Manager Assignment', async () => {
    const res = await fetch(`${BASE_URL}/api/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aurelia Haute Horlogerie',
        code: 'AUR',
        tagline: 'Swiss-Crafted Luxury Timepieces',
        managerName: 'Darsh',
        clientName: 'Philippe Stern',
        clientEmail: 'philippe@aurelia.ch',
        clientPhone: '+41 22 123 4567',
        whatsappGroupUrl: 'https://chat.whatsapp.com/demo-aurelia',
        brandColor: '#D97706'
      })
    });
    const json = await res.json();
    if (!json.success || !json.data?.id) throw new Error(json.error || 'Brand creation failed');
    createdBrandId = json.data.id;
  });

  // 3. Test 2: Task Persistence across sessions
  let createdTaskId = '';
  await test('Test 2: Universal Task Creation & Persistence', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Review Aurelia Master Chronograph Brief',
        brandId: createdBrandId,
        brandName: 'Aurelia Haute Horlogerie',
        category: 'General',
        priority: 'Critical',
        status: 'To Do',
        assigneeName: 'Darsh',
        dueDate: new Date(Date.now() + 86400000).toISOString()
      })
    });
    const json = await res.json();
    if (!json.success || !json.data?.id) throw new Error('Task creation failed');
    createdTaskId = json.data.id;

    // Verify persistence
    const checkRes = await fetch(`${BASE_URL}/api/data`);
    const checkJson = await checkRes.json();
    const found = checkJson.data.tasks.find(t => t.id === createdTaskId);
    if (!found) throw new Error('Created task not found in database');
  });

  // 4. Test 3: Task Completion & Timestamp Tracking
  await test('Test 3: Task Completion Tracking & Confetti / Done State', async () => {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: createdTaskId,
        status: 'Done',
        currentUserName: 'Darsh'
      })
    });
    const json = await res.json();
    if (!json.success || json.data.status !== 'Done') throw new Error('Task status not updated to Done');
    if (!json.data.completedAt) throw new Error('completedAt timestamp was not recorded');
    if (json.data.completedByName !== 'Darsh') throw new Error('completedByName was not recorded');
  });

  // 5. Test 4: Shoot Creation & Automated Post-Shoot Data Sorting Trigger
  await test('Test 4: Shoot Completed → Automated Data Sorting Trigger', async () => {
    // Create shoot
    const shootRes = await fetch(`${BASE_URL}/api/shoots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Aurelia Autumn Golden Hour Shoot',
        brandId: createdBrandId,
        brandName: 'Aurelia Haute Horlogerie',
        shootDate: '2026-10-21',
        startTime: '15:00',
        endTime: '19:00',
        location: 'Lake Como Villa',
        brandManager: 'Darsh',
        rawDataLocation: 'Google Drive: /Raw Footage/Aurelia_Como_2026',
        status: 'Planned'
      })
    });
    const shootJson = await shootRes.json();
    const shootId = shootJson.data.id;

    // Mark shoot Completed
    const completeRes = await fetch(`${BASE_URL}/api/shoots`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: shootId,
        status: 'Completed'
      })
    });
    const completeJson = await completeRes.json();
    if (!completeJson.success) throw new Error('Shoot completion failed');

    // Verify automation created a Data Sorting task
    const checkRes = await fetch(`${BASE_URL}/api/data`);
    const checkJson = await checkRes.json();
    const dataSortingTask = checkJson.data.tasks.find(
      t => t.brandName === 'Aurelia Haute Horlogerie' && t.category === 'Data Sorting'
    );
    if (!dataSortingTask) throw new Error('Automation failed to generate Data Sorting task');
  });

  // 6. Test 5: Creative Review Loop (Submit -> Request Changes -> Resubmit -> Approve)
  await test('Test 5: Creative Review Loop & Version History Tracking', async () => {
    // 1. Submit Reel
    const postRes = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Aurelia Tourbillon Macro Reel',
        brandId: createdBrandId,
        brandName: 'Aurelia Haute Horlogerie',
        contentType: 'Reel',
        platform: 'Instagram',
        approvalStatus: 'Submitted for Review',
        assignedCreator: 'Chandan',
        version: 1,
        reviewNotes: 'First cut of macro movement'
      })
    });
    const postJson = await postRes.json();
    const contentId = postJson.data.id;

    // 2. Request changes
    const reqChangesRes = await fetch(`${BASE_URL}/api/posts`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: contentId,
        approvalStatus: 'Changes Required',
        reviewerName: 'Darsh',
        reviewerFeedback: 'Slow down the dial transition by 0.5s'
      })
    });
    const reqChangesJson = await reqChangesRes.json();
    if (reqChangesJson.data.version !== 2) throw new Error('Version did not increment on Changes Required');
    if (!reqChangesJson.data.feedbackHistory?.length) throw new Error('Feedback history not recorded');

    // 3. Approve
    const approveRes = await fetch(`${BASE_URL}/api/posts`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: contentId,
        approvalStatus: 'Approved',
        reviewerName: 'Darsh',
        reviewerFeedback: 'Approved for posting!'
      })
    });
    const approveJson = await approveRes.json();
    if (approveJson.data.approvalStatus !== 'Approved') throw new Error('Approval state failed');
    if (approveJson.data.publishingStatus !== 'Scheduled') throw new Error('Approved item should move to Scheduled');
  });

  // 7. Test 6: Publishing Confirmation & URL Recording
  await test('Test 6: Social Media Publishing Confirmation & Timestamp', async () => {
    const listRes = await fetch(`${BASE_URL}/api/data`);
    const listJson = await listRes.json();
    const post = listJson.data.content.find(c => c.brandName === 'Aurelia Haute Horlogerie');
    if (!post) throw new Error('Content not found');

    const pubRes = await fetch(`${BASE_URL}/api/posts`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: post.id,
        publishingStatus: 'Published',
        publishedUrl: 'https://www.instagram.com/reel/C8_Aurelia_Live/',
        publisherName: 'Isha'
      })
    });
    const pubJson = await pubRes.json();
    if (pubJson.data.publishingStatus !== 'Published') throw new Error('Publish status failed');
    if (!pubJson.data.publishedAt) throw new Error('publishedAt timestamp not recorded');
    if (pubJson.data.publishedUrl !== 'https://www.instagram.com/reel/C8_Aurelia_Live/') throw new Error('publishedUrl not stored');
  });

  // 8. Test 7: Ads Campaign Monitoring & Milestone Generation
  await test('Test 7: Ads Campaign Milestone Auto-Task Generation', async () => {
    const adRes = await fetch(`${BASE_URL}/api/ads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aurelia Festive Launch Campaign',
        brandId: createdBrandId,
        brandName: 'Aurelia Haute Horlogerie',
        platform: 'Meta Ads',
        budget: 200000,
        objective: 'Conversions',
        analysisDates: ['2026-10-24', '2026-10-29'],
        campaignManager: 'Darsh'
      })
    });
    const adJson = await adRes.json();
    if (!adJson.success) throw new Error('Ad campaign creation failed');

    // Verify auto-generated analysis tasks
    const checkRes = await fetch(`${BASE_URL}/api/data`);
    const checkJson = await checkRes.json();
    const createdAdId = adJson.data.id;
    const analysisTasks = checkJson.data.tasks.filter(
      t => t.campaignId === createdAdId
    );
    if (analysisTasks.length !== 2) throw new Error(`Expected 2 analysis tasks for campaign ${createdAdId}, found ${analysisTasks.length}`);
  });

  // 9. Test 8: Meeting Action Item 1-Click Task Conversion
  await test('Test 8: Meeting Action Item 1-Click Task Conversion', async () => {
    const meetRes = await fetch(`${BASE_URL}/api/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Aurelia Brand Launch Strategy Sync',
        brandId: createdBrandId,
        brandName: 'Aurelia Haute Horlogerie',
        date: '2026-10-21',
        attendees: ['Darsh', 'Philippe Stern'],
        actionItems: [
          { id: 'act-test-1', text: 'Deliver finalized color palette for watch dials', assignee: 'James', isConvertedToTask: false }
        ]
      })
    });
    const meetJson = await meetRes.json();
    const meetingId = meetJson.data.id;

    // Convert action item
    const convertRes = await fetch(`${BASE_URL}/api/meetings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: meetingId,
        convertActionItemId: 'act-test-1'
      })
    });
    const convertJson = await convertRes.json();
    if (!convertJson.data.actionItems[0].isConvertedToTask) throw new Error('Action item isConvertedToTask was not updated');

    // Verify converted task exists in tasks ledger
    const checkRes = await fetch(`${BASE_URL}/api/data`);
    const checkJson = await checkRes.json();
    const convertedTask = checkJson.data.tasks.find(t => t.title.includes('Deliver finalized color palette'));
    if (!convertedTask) throw new Error('Converted action item not found in tasks list');
  });

  // 10. Test 9: Dynamic Workflow Versioning
  await test('Test 9: Dynamic Workflow Stage Customization & Versioning', async () => {
    const dataRes = await fetch(`${BASE_URL}/api/data`);
    const dataJson = await dataRes.json();
    const wf = dataJson.data.workflows[0];

    const updatedStages = [
      ...wf.stages,
      { id: 'custom-stage', name: 'Creative Director Grading', order: wf.stages.length + 1, responsibleRole: 'brand_manager', actionType: 'review', dueDaysFromPrevious: 1, autoTriggerNext: true }
    ];

    const wfRes = await fetch(`${BASE_URL}/api/workflows`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: wf.id,
        stages: updatedStages
      })
    });
    const wfJson = await wfRes.json();
    if (wfJson.data.version <= wf.version) throw new Error('Workflow version did not increment upon edit');
  });

  // 11. Test 10: Notifications Read/Unread Status
  await test('Test 10: In-App Notifications Read Tracking', async () => {
    const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true })
    });
    const notifJson = await notifRes.json();
    const anyUnread = notifJson.notifications.some(n => !n.isRead);
    if (anyUnread) throw new Error('Not all notifications were marked read');
  });

  // 12. Test 11: Spreadsheet CSV Export & Import
  await test('Test 11: Spreadsheet CSV Export & Import Validation', async () => {
    // Test export
    const exportRes = await fetch(`${BASE_URL}/api/export-import?type=tasks`);
    const csvContent = await exportRes.text();
    if (!csvContent.includes('Title,Brand') && !csvContent.includes('ID,Title')) {
      throw new Error('CSV export format invalid');
    }

    // Test import
    const importRes = await fetch(`${BASE_URL}/api/export-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'tasks',
        records: [
          {
            title: 'Bulk Imported Packaging Review Task',
            brandName: 'HOF',
            category: 'General',
            priority: 'Medium',
            status: 'To Do',
            assigneeName: 'Darsh',
            dueDate: new Date().toISOString()
          }
        ]
      })
    });
    const importJson = await importRes.json();
    if (!importJson.success || importJson.count !== 1) throw new Error('CSV import failed');
  });

  console.log(`\n=============================================`);
  console.log(`🎯 BrandFlow End-to-End Test Summary:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`=============================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
