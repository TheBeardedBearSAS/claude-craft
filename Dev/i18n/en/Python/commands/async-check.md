# Python Async Check

## Arguments

$ARGUMENTS (optional: path to analyze)

## MISSION

Analyze asynchronous code usage in the Python project and identify issues with async/await patterns, blocking calls, and performance problems.

### Step 1: Identify Async Functions

```bash
# Find all async functions
rg "async def" --type py

# Find await usage
rg "await " --type py
```

Check for:
- [ ] Async functions properly declared
- [ ] Await used for async calls
- [ ] No blocking code in async functions
- [ ] Proper exception handling in async

### Step 2: Detect Blocking Calls

```python
# Common blocking calls to avoid in async:
- time.sleep()        # Use asyncio.sleep()
- requests.get()      # Use httpx or aiohttp
- open()              # Use aiofiles
- db.execute()        # Use async DB driver
```

### Step 3: Check Async Patterns

```python
# Good patterns
async def fetch_data(url: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

# Check for:
- [ ] async with for context managers
- [ ] await for async operations
- [ ] asyncio.gather() for concurrent tasks
- [ ] Proper error handling with try/except
```

### Step 4: Generate Report

```
ASYNC CODE ANALYSIS
=====================================

ASYNC FUNCTIONS: XX
AWAIT STATEMENTS: XX
BLOCKING CALLS FOUND: XX

ISSUES DETECTED:

1. Blocking call in async function
   File: app/services/user.py:45
   Issue: Using time.sleep() instead of asyncio.sleep()
   Fix: Replace with asyncio.sleep()

2. Missing await
   File: app/api/endpoints.py:78
   Issue: Async function called without await
   Fix: Add await keyword

RECOMMENDATIONS:
- Replace blocking calls with async alternatives
- Use asyncio.gather() for concurrent operations
- Add proper timeout handling
```
