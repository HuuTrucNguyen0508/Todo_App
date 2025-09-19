#!/usr/bin/env node

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4003';

async function makeRequest(method, path, body = null) {
  const url = `${API_BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`${method} ${url}`);

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

async function runSmokeTests() {
  console.log('🚀 Starting smoke tests...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const health = await makeRequest('GET', '/health');
    console.log('✅ Health check passed:', health.status);
    console.log();

    // Test 2: Get initial todos (should be empty)
    console.log('2. Getting initial todos...');
    const initialTodos = await makeRequest('GET', '/todos');
    console.log('✅ Initial todos retrieved:', initialTodos.length, 'todos');
    console.log();

    // Test 3: Create a new todo
    console.log('3. Creating a new todo...');
    const newTodo = await makeRequest('POST', '/todos', {
      title: 'Test todo from smoke test',
    });
    console.log('✅ Todo created:', newTodo.id, '-', newTodo.title);
    console.log();

    // Test 4: Get todos (should have 1 todo)
    console.log('4. Getting todos after creation...');
    const todosAfterCreate = await makeRequest('GET', '/todos');
    console.log('✅ Todos retrieved:', todosAfterCreate.length, 'todos');

    if (todosAfterCreate.length === 0) {
      throw new Error('Expected at least 1 todo after creation');
    }
    console.log();

    // Test 5: Toggle todo completion
    console.log('5. Toggling todo completion...');
    const toggledTodo = await makeRequest(
      'PATCH',
      `/todos/${newTodo.id}/toggle`,
      {}
    );
    console.log(
      '✅ Todo toggled:',
      toggledTodo.id,
      '- completed:',
      toggledTodo.completed
    );

    if (!toggledTodo.completed) {
      throw new Error('Expected todo to be completed after toggle');
    }
    console.log();

    // Test 6: Toggle back to incomplete
    console.log('6. Toggling todo back to incomplete...');
    const untoggledTodo = await makeRequest(
      'PATCH',
      `/todos/${newTodo.id}/toggle`,
      {}
    );
    console.log(
      '✅ Todo untoggled:',
      untoggledTodo.id,
      '- completed:',
      untoggledTodo.completed
    );

    if (untoggledTodo.completed) {
      throw new Error('Expected todo to be incomplete after second toggle');
    }
    console.log();

    // Test 7: Delete the todo
    console.log('7. Deleting the todo...');
    await makeRequest('DELETE', `/todos/${newTodo.id}`);
    console.log('✅ Todo deleted successfully');
    console.log();

    // Test 8: Verify todo is deleted
    console.log('8. Verifying todo deletion...');
    const todosAfterDelete = await makeRequest('GET', '/todos');
    console.log('✅ Todos after deletion:', todosAfterDelete.length, 'todos');

    const deletedTodo = todosAfterDelete.find((todo) => todo.id === newTodo.id);
    if (deletedTodo) {
      throw new Error('Todo should have been deleted');
    }
    console.log();

    // Test 9: Check metrics endpoint
    console.log('9. Testing metrics endpoint...');
    const metrics = await makeRequest('GET', '/metrics');
    console.log(
      '✅ Metrics endpoint working, response length:',
      metrics.length,
      'chars'
    );

    if (!metrics.includes('api_todos_created_total')) {
      throw new Error('Expected metrics to contain todo creation counter');
    }
    console.log();

    console.log('🎉 All smoke tests passed!');
    console.log('\n📊 Test Summary:');
    console.log('- Health check: ✅');
    console.log('- Todo CRUD operations: ✅');
    console.log('- Metrics endpoint: ✅');
    console.log('- API connectivity: ✅');
  } catch (error) {
    console.error('❌ Smoke test failed:', error.message);
    process.exit(1);
  }
}

// Wait for API to be ready
async function waitForAPI(maxRetries = 30, delay = 2000) {
  console.log('⏳ Waiting for API to be ready...');

  for (let i = 0; i < maxRetries; i++) {
    try {
      await makeRequest('GET', '/health');
      console.log('✅ API is ready!');
      return;
    } catch (error) {
      console.log(
        `Attempt ${i + 1}/${maxRetries} failed, retrying in ${delay / 1000}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('API did not become ready in time');
}

async function main() {
  try {
    await waitForAPI();
    await runSmokeTests();
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

main();
