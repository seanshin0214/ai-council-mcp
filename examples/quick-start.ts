/**
 * Quick Start Example for AI Council MCP
 *
 * This script demonstrates:
 * 1. Creating an admin user
 * 2. Uploading documents
 * 3. Querying with RAG
 */

// Example API requests (use with curl or your HTTP client)

// 1. Create Admin User (run once during setup)
const createAdminExample = `
# First, manually insert an admin user in the database:
docker exec -it ai-council-postgres psql -U postgres -d ai_council -c "
INSERT INTO users (username, api_key, role)
VALUES ('admin', 'ak_admin_initial_key_12345', 'admin');
"
`;

// 2. Create a regular writer user
const createWriterExample = `
curl -X POST http://localhost:3000/admin/users \\
  -H "X-API-Key: ak_admin_initial_key_12345" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "writer1",
    "role": "writer"
  }'

# Response will contain the new API key:
# {
#   "success": true,
#   "username": "writer1",
#   "apiKey": "ak_xxxxxxxxxxxxxxx",
#   "role": "writer"
# }
`;

// 3. Upload a document
const uploadDocumentExample = `
curl -X POST http://localhost:3000/documents \\
  -H "X-API-Key: ak_xxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing computer programs that can access data and use it to learn for themselves.",
    "metadata": {
      "source": "ml-basics.txt",
      "category": "education"
    }
  }'
`;

// 4. Batch upload multiple documents
const batchUploadExample = `
curl -X POST http://localhost:3000/documents/batch \\
  -H "X-API-Key: ak_xxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "documents": [
      {
        "content": "Neural networks are computing systems inspired by biological neural networks. They consist of layers of interconnected nodes that process information.",
        "metadata": { "source": "neural-nets.txt" }
      },
      {
        "content": "Deep learning is a subset of machine learning that uses neural networks with multiple layers. It excels at processing complex patterns in images, sound, and text.",
        "metadata": { "source": "deep-learning.txt" }
      }
    ]
  }'
`;

// 5. Query with automatic model selection
const queryExample = `
curl -X POST http://localhost:3000/query \\
  -H "X-API-Key: ak_xxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "What is the difference between machine learning and deep learning?",
    "useCache": true
  }'

# Response:
# {
#   "answer": "Machine learning is a broader field...",
#   "sources": [...],
#   "metadata": {
#     "modelUsed": "claude",
#     "complexity": "moderate",
#     "responseTime": "1.5s"
#   }
# }
`;

// 6. Force a specific model
const queryWithModelExample = `
curl -X POST http://localhost:3000/query \\
  -H "X-API-Key: ak_xxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "Implement a simple neural network in Python",
    "model": "claude",
    "useCache": false
  }'
`;

// 7. Check health
const healthCheckExample = `
curl http://localhost:3000/health
`;

// 8. View metrics
const metricsExample = `
curl http://localhost:3000/metrics
`;

// TypeScript Usage Example
async function typescriptExample() {
  const API_KEY = 'ak_xxxxxxxxxxxxxxx';
  const BASE_URL = 'http://localhost:3000';

  // Upload document
  const uploadResponse = await fetch(`${BASE_URL}/documents`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: 'Your document content here...',
      metadata: { source: 'example.txt' },
    }),
  });

  const uploadResult = await uploadResponse.json();
  console.log('Upload result:', uploadResult);

  // Query
  const queryResponse = await fetch(`${BASE_URL}/query`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: 'What is in the document?',
    }),
  });

  const queryResult = await queryResponse.json();
  console.log('Query result:', queryResult);
}

// Export examples
export {
  createAdminExample,
  createWriterExample,
  uploadDocumentExample,
  batchUploadExample,
  queryExample,
  queryWithModelExample,
  healthCheckExample,
  metricsExample,
  typescriptExample,
};

console.log(`
AI Council MCP - Quick Start Examples
======================================

1. Create Admin User:
${createAdminExample}

2. Create Writer User:
${createWriterExample}

3. Upload Document:
${uploadDocumentExample}

4. Batch Upload:
${batchUploadExample}

5. Query:
${queryExample}

6. Query with Specific Model:
${queryWithModelExample}

7. Health Check:
${healthCheckExample}

8. Metrics:
${metricsExample}
`);
