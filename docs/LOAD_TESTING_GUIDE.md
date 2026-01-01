# Load Testing Guide - AI Chat Platform

## 🚀 Overview
This guide covers how to load test your AI Chat Platform with 100+ concurrent users to ensure it doesn't crash under heavy load.

## 📋 What Gets Tested?
- **Homepage & Chat Page**: Basic page loads
- **Guest Sessions**: Create and manage guest sessions
- **Chat Messages**: Send prompts and receive responses
- **Chat History**: Retrieve chat history
- **Share Links**: Create and view shared chats
- **APIs**: News, Weather, Timezone endpoints
- **Database Queries**: Guest session lookups, chat saves

## ✅ Prerequisites

### 1. Start Your Development Server
```bash
npm run dev
# Server should be running on http://localhost:3002
```

### 2. Install Load Testing Tools

#### Option 1: Locust (Python) - RECOMMENDED FOR BEGINNERS
```bash
# Install Python 3.8+
# Then install Locust
pip install locust
```

#### Option 2: Artillery (Node.js) - RECOMMENDED FOR YOUR STACK
```bash
npm install -g artillery
```

#### Option 3: K6 (Modern) - RECOMMENDED FOR CLOUD
```bash
# macOS
brew install k6

# Windows (with Chocolatey)
choco install k6

# Or download from https://k6.io/docs/getting-started/installation
```

## 🧪 Running Load Tests

### Method 1: Using Locust (Best for Beginners)

```bash
cd src/scripts

# Start Locust with UI
locust -f load-test-locust.py --host=http://localhost:3002

# Open browser to http://localhost:8089
# Configure:
#   - Number of users: 100
#   - Spawn rate: 5 users/sec
#   - Click "Start swarming"
```

**What to expect:**
- Real-time user interface
- Live graph of response times
- Request/second tracking
- Detailed failure logs

**Look for:**
- ✅ Response times < 500ms
- ✅ Error rate < 5%
- ✅ Consistent request rate

---

### Method 2: Using Artillery (Recommended)

```bash
cd src/scripts

# Run the test
artillery run load-test-artillery.yml --target http://localhost:3002

# Or with detailed output
artillery run load-test-artillery.yml -t http://localhost:3002 -v
```

**Test Profile:**
```
Phase 1: Ramp up to 100 users over 2 minutes
Phase 2: Sustain 100 users for 5 minutes
Phase 3: Ramp down over 1 minute
```

**Sample Output:**
```
Response time (ms)
  min: 45
  med: 128
  max: 2456
  p(95): 589
  p(99): 1250

Request rate (req/sec)
  50 req/sec
  
Error rate
  3.2%
```

---

### Method 3: Using K6 (Modern & Cloud-Ready)

```bash
cd src/scripts

# Run the test
k6 run load-test-k6.js

# Run with output
k6 run -u 100 -d 10m load-test-k6.js
```

**Output includes:**
- Response time percentiles (p95, p99)
- Requests per second
- Error rates by endpoint
- Real-time metrics

---

### Method 4: Real-time Performance Monitoring

While running load tests, monitor your server health:

```bash
# Terminal 1: Run load test (e.g., Artillery)
cd src/scripts
artillery run load-test-artillery.yml --target http://localhost:3002

# Terminal 2: Run performance monitor
node performance-monitor.js http://localhost:3002 5000 600000
```

**Monitor shows:**
- CPU usage
- Memory usage
- Response times
- Error rates
- Request/second

---

## 📊 Understanding Results

### Response Time Targets
```
Excellent: < 200ms
Good:      200-500ms
Acceptable: 500-1000ms
Poor:      > 1000ms
Failing:   Timeout or connection refused
```

### Error Rate Targets
```
✅ Excellent: < 1%
✅ Good:      1-5%
⚠️  Acceptable: 5-10%
❌ Poor:      > 10%
```

### CPU/Memory Targets
```
✅ Healthy: < 70%
⚠️  Caution: 70-85%
❌ Critical: > 85%
```

---

## 🔍 Common Issues & Solutions

### Issue 1: Connection Refused
**Problem:** Cannot connect to `http://localhost:3002`
**Solution:**
```bash
# Make sure server is running
npm run dev

# Check port is correct
netstat -ano | findstr :3002
```

### Issue 2: High Error Rate (> 10%)
**Problem:** Many requests failing
**Solution:**
```bash
# Check server logs for errors
# Look for database connection issues
# Check if API endpoints are working

# Test manually
curl http://localhost:3002/api/guest/create
```

### Issue 3: Response Times > 2 seconds
**Problem:** Slow responses
**Solution:**
```bash
# Check database performance
# Review API endpoint code
# Look for missing indexes
# Check network latency
```

### Issue 4: Memory Keeps Growing
**Problem:** Memory leak detected
**Solution:**
```bash
# Check Node.js process
node --max-old-space-size=4096 run.js

# Look for circular references
# Check database connection pooling
```

---

## 📈 Testing Checklist

Before declaring your website production-ready:

- [ ] Can handle 100 concurrent users
- [ ] Response times < 500ms (p95)
- [ ] Error rate < 5%
- [ ] CPU usage < 70%
- [ ] Memory usage < 70%
- [ ] No crashes during 10-minute sustained load
- [ ] Graceful degradation if load exceeds capacity
- [ ] Proper error messages displayed to users
- [ ] Database queries are optimized
- [ ] API endpoints don't have race conditions

---

## 🚀 Advanced Testing Scenarios

### Scenario 1: Spike Test
Suddenly increase load from 10 to 100 users in 10 seconds

```bash
# Using Artillery custom script
# Modify load-test-artillery.yml:
phases:
  - duration: 10
    arrivalRate: 100  # High spike
```

### Scenario 2: Soak Test
Keep 50 users for 24 hours to find memory leaks

```bash
# Modify load-test-k6.js:
stages: [
  { duration: '24h', target: 50 }
]
```

### Scenario 3: Stress Test
Keep increasing users until server breaks

```bash
# Using Locust UI:
# Set spawn rate to 10 users/sec
# Keep increasing until failures appear
```

---

## 📊 Generating Reports

### Artillery Report
```bash
artillery run load-test-artillery.yml \
  --target http://localhost:3002 \
  -o report.json

# Convert to HTML (requires npm i artillery-plugin-expect)
artillery report report.json --output report.html
```

### K6 Report
```bash
k6 run load-test-k6.js --summary-export=summary.json
# Results auto-saved to load-test-results.json
```

### Performance Monitor Report
```bash
node performance-monitor.js \
  http://localhost:3002 \
  5000 \
  600000

# Creates: performance-report-{timestamp}.json
```

---

## 💡 Best Practices

1. **Baseline First**: Test with few users to establish baseline
2. **Ramp Up Gradually**: Don't jump to 100 users instantly
3. **Run Multiple Times**: Run tests 3+ times for consistency
4. **Test Off-Peak**: Run during off-peak hours
5. **Monitor Everything**: CPU, Memory, Database, Disk
6. **Check Logs**: Review server logs during tests
7. **Profile Code**: Use Node.js profiler for slow endpoints
8. **Database Indexing**: Ensure proper indexes exist
9. **Connection Pooling**: Configure proper database pools
10. **Cache Results**: Cache frequently accessed data

---

## 🔧 Tuning Your Server

### Enable Caching
```javascript
// Add response caching
app.use(compression());
app.use(cors());
```

### Optimize Database
```sql
-- Add indexes for common queries
CREATE INDEX idx_guest_sessions_token ON guest_sessions(session_token);
CREATE INDEX idx_chat_history_user ON chat_history(user_id);
CREATE INDEX idx_chat_shares_token ON chat_shares(token);
```

### Increase Node.js Memory
```bash
NODE_OPTIONS='--max-old-space-size=4096' npm run dev
```

### Enable Clustering
```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
}
```

---

## 📞 Support

If you encounter issues:
1. Check server logs: `npm run dev`
2. Test manually: `curl http://localhost:3002`
3. Check database connectivity
4. Review API endpoint code
5. Monitor system resources

---

## 🎯 Success Criteria

Your website is production-ready when:
- ✅ Handles 100+ concurrent users
- ✅ Response times < 500ms for 95% of requests
- ✅ Error rate < 5%
- ✅ No crashes or memory leaks
- ✅ CPU/Memory usage < 70%
- ✅ Database performs well under load
- ✅ APIs are resilient and properly throttled

---

## 📚 Additional Resources

- **Locust Docs**: https://locust.io/
- **Artillery Docs**: https://artillery.io/
- **K6 Docs**: https://k6.io/docs/
- **Node.js Best Practices**: https://nodejs.org/en/docs/guides/nodejs-performance-optimization/
- **Supabase Performance**: https://supabase.com/docs/guides/database/performance-tuning

---

**Last Updated**: December 31, 2025
**Version**: 1.0