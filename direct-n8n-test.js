// Direct test to n8n webhook (bypassing the app)
const testN8nDirect = async () => {
    const webhookUrl = "https://n8n-pro-775604255858.asia-south1.run.app/webhook/send-pdf-email";
    
    const payload = {
        // Enhanced payload with multiple field formats
        recipientEmail: "your-email-here@example.com", // <-- REPLACE THIS WITH YOUR EMAIL
        emailSubject: "🧪 Direct Test Email from n8n",
        emailBody: `
            <h2>Direct n8n Test Successful!</h2>
            <p>This test bypasses your app and sends directly to n8n.</p>
            <p><strong>Details:</strong></p>
            <ul>
                <li>Source: Direct n8n Test</li>
                <li>Time: ${new Date().toLocaleString()}</li>
                <li>Status: Testing Direct Connection</li>
            </ul>
            <p>If you receive this, your n8n workflow is working! 🎉</p>
            <br>
            <p>Best regards,<br>Team WhatMyRank</p>
        `,
        attachmentName: "direct-test-report.pdf",
        attachmentData: "JVBERi0xLjQKMSAwIG9iZGVmaW5lIGRvY3RvcgoyIDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAzIDAgUj4+PmVuZG9iagplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSA0IDAgUi9GMiA1IDAgUj4+Pj4vTWVkaWFCb3hbMCAwIDYxMiAwIDAgY20+L0NvbnRlbnRzIDYgMCBSPj4+CmVuZG9iago0IDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+PgplbmRvYmoKNSAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2EvRW5jb2RpbmcvV2luQW5zaUVuY29kaW5nPj4KZW5kb2JqCjYgMCBvYmoKPDwvTGVuZ3RoIDQ0Pj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgooVGVzdCBEb2N1bWVudCkgVGoKRVQKQm9yZWsgZW5kIG9mIHRlc3QgZG9jdW1lbnQuCmVuZHN0cmVhbQplbmRvYmoKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMTc5IDAwMDAwIG4gCjAwMDAwMDAyODUgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDYvUm9vdCAxIDAgUi9JbmZvIDUgMCBSPj4Kc3RhcnR4cmVmCjM1NAolJUVPRg==",
        attachmentType: "application/pdf",
        
        // Alternative field names (backup)
        to: "your-email-here@example.com", // <-- REPLACE THIS WITH YOUR EMAIL
        subject: "🧪 Direct Test Email from n8n",
        body: `
            <h2>Direct n8n Test Successful!</h2>
            <p>This test bypasses your app and sends directly to n8n.</p>
            <p><strong>Details:</strong></p>
            <ul>
                <li>Source: Direct n8n Test</li>
                <li>Time: ${new Date().toLocaleString()}</li>
                <li>Status: Testing Direct Connection</li>
            </ul>
            <p>If you receive this, your n8n workflow is working! 🎉</p>
            <br>
            <p>Best regards,<br>Team WhatMyRank</p>
        `,
        filename: "direct-test-report.pdf",
        content: "JVBERi0xLjQKMSAwIG9iZGVmaW5lIGRvY3RvcgoyIDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAzIDAgUj4+PmVuZG9iagplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSA0IDAgUi9GMiA1IDAgUj4+Pj4vTWVkaWFCb3hbMCAwIDYxMiAwIDAgY20+L0NvbnRlbnRzIDYgMCBSPj4+CmVuZG9iago0IDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0hlbHZldGljYS9FbmNvZGluZy9XaW5BbnNpRW5jb2Rpbmc+PgplbmRvYmoKNSAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2EvRW5jb2RpbmcvV2luQW5zaUVuY29kaW5nPj4KZW5kb2JqCjYgMCBvYmoKPDwvTGVuZ3RoIDQ0Pj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgooVGVzdCBEb2N1bWVudCkgVGoKRVQKQm9yZWsgZW5kIG9mIHRlc3QgZG9jdW1lbnQuCmVuZHN0cmVhbQplbmRvYmoKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMTc5IDAwMDAwIG4gCjAwMDAwMDAyODUgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDYvUm9vdCAxIDAgUi9JbmZvIDUgMCBSPj4Kc3RhcnR4cmVmCjM1NAolJUVPRg==",
        contentType: "application/pdf",
        
        // Metadata
        sentAt: new Date().toISOString(),
        source: "direct-n8n-test"
    };

    console.log('🔗 Testing n8n directly...');
    console.log('📧 IMPORTANT: Replace "your-email@example.com" with your actual email!');
    console.log('📦 Payload size:', JSON.stringify(payload).length, 'characters');

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Direct-n8n-Test/1.0'
            },
            body: JSON.stringify(payload),
        });

        console.log('📊 Response Status:', response.status);
        console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('📊 Response Body:', responseText);

        if (response.ok) {
            console.log('✅ n8n webhook test successful!');
            console.log('📧 Check your email inbox for the test message.');
            console.log('🔍 Also check your n8n dashboard for executions.');
        } else {
            console.log('❌ n8n webhook test failed:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ n8n test error:', error);
    }
};

// Run the test
testN8nDirect();
