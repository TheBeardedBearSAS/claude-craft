# Mandatory Analysis Workflow

## Fundamental Principle

**NO code modification should be made without a complete preliminary analysis.**

This rule is absolute and applies to:
- Creating new features
- Fixing bugs
- Refactoring
- Optimizations
- Configuration changes
- Dependency updates

## 7-Step Analysis Methodology

### 1. Understanding the Need

#### Questions to Ask

1. **What is the exact objective?**
   - What functionality needs to be added/modified?
   - What problem needs to be solved?
   - What is the expected behavior?

2. **What is the business context?**
   - What is the business impact?
   - Which users are affected?
   - Are there specific business constraints?

3. **What are the technical constraints?**
   - Performance (response time, throughput)
   - Scalability
   - Security
   - Compatibility

#### Actions to Perform

```python
# Example of need documentation
"""
NEED: Add an email notification system when creating an order

CONTEXT:
- Customers must receive immediate confirmation
- The system must support 10,000 orders/day
- Emails must be sent asynchronously
- Email templates must be customizable

CONSTRAINTS:
- API response time < 200ms (sending must be asynchronous)
- Automatic retry on failure
- Complete logging for audit
- Multi-language support

ACCEPTANCE CRITERIA:
- Email sent within 5 minutes of order
- Template customizable by order type
- Tracking of sent/failed emails
- Sending monitoring dashboard
"""
```

### 2. Exploring Existing Code

#### Exploration Tools

```bash
# Search for similar patterns
rg "class.*Service" --type py
rg "async def.*email" --type py
rg "from.*repository import" --type py

# Analyze structure
tree src/ -L 3 -I "__pycache__|*.pyc"

# Identify dependencies
rg "^import|^from" src/ --type py | sort | uniq

# Find existing tests
find tests/ -name "*test*.py" -o -name "test_*.py"
```

#### Questions to Ask

1. **Does similar code exist?**
   - Existing service patterns
   - Similar repositories
   - Comparable use cases

2. **What is the current architecture?**
   - How are layers organized?
   - Where to place the new code?
   - What abstractions already exist?

3. **What are the project standards?**
   - Naming conventions used
   - Error handling patterns
   - Test structure

#### Analysis Example

```python
# EXISTING CODE ANALYSIS
"""
1. EXISTING SERVICES:
   - src/myapp/domain/services/order_service.py
   - src/myapp/domain/services/payment_service.py
   Pattern: Business services in domain/services/

2. ASYNCHRONOUS COMMUNICATION:
   - Celery infrastructure configured (infrastructure/tasks/)
   - 'default' and 'emails' queues already defined
   Pattern: Celery tasks for async operations

3. REPOSITORIES:
   - Repository pattern with interface + implementation
   - Location: domain/repositories/ (interfaces)
   - Implementation: infrastructure/database/repositories/

4. ERROR HANDLING:
   - Custom exceptions in shared/exceptions/
   - Pattern: DomainException, ApplicationException, InfrastructureException

5. TESTS:
   - Fixtures in tests/conftest.py
   - Mocks with pytest-mock
   - Unit tests: tests/unit/
   - Integration tests: tests/integration/

CONCLUSION:
- Create EmailService in domain/services/
- Create EmailRepository interface in domain/repositories/
- Implement with Celery in infrastructure/tasks/
- Follow existing pattern for exceptions
"""
```

### 3. Impact Identification

#### Impact Matrix

| Zone | Impact | Details | Required Actions |
|------|--------|---------|------------------|
| Domain Layer | HIGH | New Email entity, new service | Creation + unit tests |
| Application Layer | MEDIUM | New SendOrderConfirmation use case | Creation + tests |
| Infrastructure | HIGH | Email provider implementation, Celery task | Configuration + integration tests |
| API | LOW | No new endpoint (internal trigger) | None |
| Database | MEDIUM | New email_logs table | Migration + tests |
| Configuration | MEDIUM | Env variables for SMTP | Documentation |
| Tests | HIGH | Tests on all layers | Complete suite |
| Documentation | MEDIUM | API docs, README updates | Writing |

#### Dependency Analysis

```python
# Identify affected modules
"""
DIRECTLY IMPACTED MODULES:
├── domain/
│   ├── entities/email.py (NEW)
│   ├── services/email_service.py (NEW)
│   └── repositories/email_repository.py (NEW - interface)
├── application/
│   └── use_cases/send_order_confirmation.py (NEW)
├── infrastructure/
│   ├── email/
│   │   └── smtp_email_provider.py (NEW)
│   ├── tasks/
│   │   └── email_tasks.py (NEW)
│   └── database/
│       ├── models/email_log.py (NEW)
│       └── repositories/email_repository_impl.py (NEW)

INDIRECTLY IMPACTED MODULES:
├── application/use_cases/create_order.py (MODIFIED - calls new use case)
├── infrastructure/database/migrations/ (NEW - migration)
└── infrastructure/di/container.py (MODIFIED - dependency injection)

CONFIGURATION FILES:
├── .env.example (MODIFIED - new variables)
├── docker-compose.yml (POTENTIAL - email service if mailhog)
└── pyproject.toml (POTENTIAL - new dependencies)
"""
```

### 4. Solution Design

#### Solution Architecture

```python
"""
PROPOSED ARCHITECTURE:

1. DOMAIN LAYER (Business Logic)
┌─────────────────────────────────────────────────────────────┐
│                      Email Entity                            │
│  - id: UUID                                                   │
│  - recipient: EmailAddress (Value Object)                    │
│  - subject: str                                              │
│  - body: str                                                 │
│  - sent_at: Optional[datetime]                              │
│  - status: EmailStatus (Enum)                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   EmailService (Domain)                      │
│  + create_order_confirmation(order: Order) -> Email         │
│  + validate_email_content(email: Email) -> bool             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              EmailRepository (Interface)                     │
│  + save(email: Email) -> Email                              │
│  + find_by_id(id: UUID) -> Optional[Email]                  │
│  + find_by_order_id(order_id: UUID) -> list[Email]         │
└─────────────────────────────────────────────────────────────┘

2. APPLICATION LAYER (Use Cases)
┌─────────────────────────────────────────────────────────────┐
│           SendOrderConfirmationUseCase                       │
│  - email_service: EmailService                              │
│  - email_repository: EmailRepository                        │
│  - email_provider: EmailProvider                            │
│                                                              │
│  + execute(order_id: UUID) -> EmailDTO                      │
│    1. Retrieve order                                        │
│    2. Create email via EmailService                         │
│    3. Save via EmailRepository                              │
│    4. Send via EmailProvider (async)                        │
└─────────────────────────────────────────────────────────────┘

3. INFRASTRUCTURE LAYER (Implementations)
┌─────────────────────────────────────────────────────────────┐
│              EmailRepositoryImpl                             │
│  + Implements EmailRepository                               │
│  + Uses SQLAlchemy                                          │
│  + Maps Email <-> EmailLog (DB model)                       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              SMTPEmailProvider                               │
│  + Implements EmailProvider                                 │
│  + Uses smtplib / aiosmtplib                               │
│  + Handles retry and error handling                         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              send_email_task (Celery)                        │
│  + Asynchronous task                                        │
│  + Automatic retry (3 times, exponential backoff)          │
│  + Complete logging                                         │
└─────────────────────────────────────────────────────────────┘
"""
```

#### Data Flow

```python
"""
DATA FLOW:

1. ORDER CREATION
   CreateOrderUseCase
   └── order = order_repository.save(order)
   └── send_order_confirmation_use_case.execute(order.id)  # Asynchronous

2. CONFIRMATION SENDING
   SendOrderConfirmationUseCase.execute(order_id)
   ├── order = order_repository.find_by_id(order_id)
   ├── email = email_service.create_order_confirmation(order)
   ├── email = email_repository.save(email)  # Status: PENDING
   └── send_email_task.delay(email.id)  # Celery task

3. CELERY TASK
   send_email_task(email_id)
   ├── email = email_repository.find_by_id(email_id)
   ├── try:
   │   ├── email_provider.send(email)
   │   ├── email.mark_as_sent()
   │   └── email_repository.save(email)  # Status: SENT
   └── except Exception as e:
       ├── email.mark_as_failed(e)
       ├── email_repository.save(email)  # Status: FAILED
       └── raise  # Celery retry

4. ERROR HANDLING
   - Automatic Celery retry (3 attempts)
   - Exponential backoff (2^retry * 60 seconds)
   - Logging of each attempt
   - Alert if definitive failure
"""
```

#### Technical Choices

```python
"""
JUSTIFIED TECHNICAL CHOICES:

1. CELERY vs RQ vs ARQ
   Choice: Celery
   Reasons:
   - Already used in the project
   - Advanced retry support
   - Monitoring with Flower
   - Large ecosystem

2. EMAIL PROVIDER
   Choice: aiosmtplib (async SMTP)
   Reasons:
   - Compatible with asyncio
   - Performant for high volumes
   - TLS/SSL support
   Alternative: SendGrid/AWS SES for production

3. EMAIL STORAGE
   Choice: PostgreSQL (email_logs table)
   Reasons:
   - Complete audit trail
   - Search and reporting
   - Transactional consistency
   - No need for S3 storage for simple templates

4. TEMPLATES
   Choice: Jinja2
   Reasons:
   - Python standard
   - Already used for other templates
   - Simple syntax
   - i18n support

5. VALIDATION
   Choice: Pydantic + email-validator
   Reasons:
   - Strict email validation
   - Type safety
   - FastAPI/Django integration
"""
```

### 5. Implementation Planning

#### Task Breakdown

```python
"""
IMPLEMENTATION PLAN (Order: top to bottom)

PHASE 1: DOMAIN LAYER
□ Task 1.1: Create EmailStatus enum
  └── src/myapp/domain/value_objects/email_status.py
  └── Tests: tests/unit/domain/value_objects/test_email_status.py

□ Task 1.2: Create EmailAddress value object
  └── src/myapp/domain/value_objects/email_address.py
  └── Validation with email-validator
  └── Tests: tests/unit/domain/value_objects/test_email_address.py

□ Task 1.3: Create Email entity
  └── src/myapp/domain/entities/email.py
  └── Methods: mark_as_sent(), mark_as_failed()
  └── Tests: tests/unit/domain/entities/test_email.py

□ Task 1.4: Create EmailRepository interface
  └── src/myapp/domain/repositories/email_repository.py
  └── Protocol with abstract methods

□ Task 1.5: Create EmailProvider interface
  └── src/myapp/domain/interfaces/email_provider.py
  └── Protocol for abstraction

□ Task 1.6: Create EmailService
  └── src/myapp/domain/services/email_service.py
  └── Email creation logic
  └── Tests: tests/unit/domain/services/test_email_service.py

PHASE 2: INFRASTRUCTURE LAYER
□ Task 2.1: Create database migration
  └── alembic revision --autogenerate -m "add_email_logs_table"
  └── Columns: id, recipient, subject, body, status, sent_at, error, metadata

□ Task 2.2: Create EmailLog model
  └── src/myapp/infrastructure/database/models/email_log.py
  └── SQLAlchemy model

□ Task 2.3: Create EmailRepositoryImpl
  └── src/myapp/infrastructure/database/repositories/email_repository_impl.py
  └── Implements EmailRepository
  └── Tests: tests/integration/infrastructure/repositories/test_email_repository.py

□ Task 2.4: Create SMTPEmailProvider
  └── src/myapp/infrastructure/email/smtp_provider.py
  └── SMTP configuration
  └── Tests: tests/integration/infrastructure/email/test_smtp_provider.py

□ Task 2.5: Create template engine
  └── src/myapp/infrastructure/email/template_engine.py
  └── Jinja2 templates
  └── Tests: tests/unit/infrastructure/email/test_template_engine.py

□ Task 2.6: Create Celery task
  └── src/myapp/infrastructure/tasks/email_tasks.py
  └── Retry configuration
  └── Tests: tests/integration/infrastructure/tasks/test_email_tasks.py

PHASE 3: APPLICATION LAYER
□ Task 3.1: Create EmailDTO
  └── src/myapp/application/dtos/email_dto.py
  └── Pydantic model

□ Task 3.2: Create SendOrderConfirmationUseCase
  └── src/myapp/application/use_cases/send_order_confirmation.py
  └── Tests: tests/unit/application/use_cases/test_send_order_confirmation.py

□ Task 3.3: Integrate into CreateOrderUseCase
  └── Modify src/myapp/application/use_cases/create_order.py
  └── Add asynchronous call
  └── Tests: tests/unit/application/use_cases/test_create_order.py (update)

PHASE 4: CONFIGURATION & DI
□ Task 4.1: Configure dependency injection
  └── src/myapp/infrastructure/di/container.py
  └── Register EmailService, repositories, providers

□ Task 4.2: Add environment variables
  └── .env.example
  └── Documentation in README

□ Task 4.3: Create email templates
  └── src/myapp/infrastructure/email/templates/order_confirmation.html
  └── src/myapp/infrastructure/email/templates/order_confirmation.txt

PHASE 5: TESTS & QUALITY
□ Task 5.1: End-to-end tests
  └── tests/e2e/test_order_confirmation_flow.py

□ Task 5.2: Performance tests
  └── tests/performance/test_email_throughput.py
  └── Verify 10k emails/day

□ Task 5.3: Code quality
  └── make lint
  └── make type-check
  └── make test-cov (>80%)

PHASE 6: DOCUMENTATION
□ Task 6.1: API documentation
  └── Complete docstrings
  └── Sphinx docs

□ Task 6.2: README update
  └── Email notification section
  └── Configuration guide

□ Task 6.3: ADR (Architecture Decision Record)
  └── docs/adr/0001-email-notification-system.md
"""
```

#### Estimation

```python
"""
ESTIMATION (in hours):

PHASE 1: DOMAIN LAYER
- Task 1.1 to 1.6: 8h
  └── 2h dev + 2h tests per component (average)

PHASE 2: INFRASTRUCTURE LAYER
- Task 2.1 to 2.6: 12h
  └── Database + providers + celery

PHASE 3: APPLICATION LAYER
- Task 3.1 to 3.3: 6h
  └── Use cases + integration

PHASE 4: CONFIGURATION & DI
- Task 4.1 to 4.3: 4h
  └── Configuration + templates

PHASE 5: TESTS & QUALITY
- Task 5.1 to 5.3: 6h
  └── E2E + performance + quality

PHASE 6: DOCUMENTATION
- Task 6.1 to 6.3: 3h
  └── Complete documentation

TOTAL: 39h (≈ 5 days)
BUFFER 20%: +8h
TOTAL WITH BUFFER: 47h (≈ 6 days)
"""
```

### 6. Risk Identification

#### Risk Matrix

```python
"""
IDENTIFIED RISKS:

RISK 1: SMTP server overload
├── Probability: MEDIUM
├── Impact: HIGH
├── Description: 10k emails/day can saturate basic SMTP
└── Mitigation:
    ├── Rate limiting in Celery (max 100 emails/minute)
    ├── Dedicated queue for emails
    ├── Queue monitoring
    └── Backup provider (SendGrid/SES)

RISK 2: Emails marked as spam
├── Probability: MEDIUM
├── Impact: HIGH
├── Description: Transactional emails may be blocked
└── Mitigation:
    ├── SPF/DKIM/DMARC configured
    ├── Dedicated IP warmup
    ├── Anti-spam compliant templates
    └── Deliverability rate monitoring

RISK 3: Email loss on crash
├── Probability: LOW
├── Impact: MEDIUM
├── Description: Crash before DB persistence
└── Mitigation:
    ├── Atomic transaction (save + enqueue)
    ├── Celery dead letter queue
    ├── Failed task monitoring
    └── Manual re-enqueue system

RISK 4: Template injection
├── Probability: LOW
├── Impact: HIGH
├── Description: Code injection in templates
└── Mitigation:
    ├── Input sanitization
    ├── Pre-compiled templates
    ├── Strict data validation
    └── Security scan (bandit)

RISK 5: API performance degradation
├── Probability: LOW
├── Impact: MEDIUM
├── Description: Slow enqueue delays order creation
└── Mitigation:
    ├── Strict asynchronous enqueue
    ├── Short timeout on enqueue
    ├── Graceful fallback if queue down
    └── API response time monitoring

RISK 6: Sensitive data in emails
├── Probability: MEDIUM
├── Impact: HIGH
├── Description: Data leak via unencrypted emails
└── Mitigation:
    ├── Mandatory TLS
    ├── No sensitive data in plain text (e.g., credit cards)
    ├── Secure links with short-lived tokens
    └── Template security audit
"""
```

### 7. Test Definition

#### Testing Strategy

```python
"""
TESTING STRATEGY:

1. UNIT TESTS (Complete isolation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Domain Layer:
├── test_email_entity.py
│   ├── test_create_email_with_valid_data()
│   ├── test_mark_as_sent_updates_status_and_timestamp()
│   ├── test_mark_as_failed_stores_error_message()
│   └── test_cannot_send_already_sent_email()
│
├── test_email_address.py
│   ├── test_valid_email_address()
│   ├── test_invalid_email_raises_exception()
│   ├── test_email_normalization()
│   └── test_equality_comparison()
│
└── test_email_service.py
    ├── test_create_order_confirmation_with_valid_order()
    ├── test_create_order_confirmation_uses_correct_template()
    ├── test_validate_email_content_with_valid_email()
    └── test_validate_email_content_rejects_spam_patterns()

Application Layer:
└── test_send_order_confirmation_use_case.py
    ├── test_execute_creates_and_saves_email()
    ├── test_execute_enqueues_email_task()
    ├── test_execute_raises_if_order_not_found()
    └── test_execute_rolls_back_on_enqueue_failure()

2. INTEGRATION TESTS (Real components)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Infrastructure Layer:
├── test_email_repository.py
│   ├── test_save_email_to_database()
│   ├── test_find_by_id_returns_email()
│   ├── test_find_by_order_id_returns_all_emails()
│   └── test_update_email_status()
│
├── test_smtp_provider.py
│   ├── test_send_email_via_smtp() (with MailHog/FakeSMTP)
│   ├── test_send_email_with_attachment()
│   ├── test_connection_retry_on_failure()
│   └── test_tls_encryption_enabled()
│
└── test_email_tasks.py
    ├── test_send_email_task_successful()
    ├── test_send_email_task_retry_on_failure()
    ├── test_send_email_task_max_retries_reached()
    └── test_send_email_task_updates_database()

3. END-TO-END TESTS (Complete flow)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_order_confirmation_flow.py
    ├── test_complete_order_confirmation_flow()
    │   1. Create order via API
    │   2. Verify email created in DB
    │   3. Wait for Celery task execution
    │   4. Verify email sent (MailHog)
    │   5. Verify status = SENT in DB
    │
    ├── test_order_confirmation_with_smtp_failure()
    │   1. Create order
    │   2. Simulate SMTP failure
    │   3. Verify Celery retry
    │   4. Verify status = FAILED after max retries
    │
    └── test_order_confirmation_performance()
        └── Create 100 concurrent orders
        └── Verify all emails sent < 5min

4. PERFORMANCE TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_email_throughput.py
    ├── test_10k_emails_per_day_throughput()
    ├── test_api_response_time_under_200ms()
    ├── test_queue_processing_rate()
    └── test_database_load_under_stress()

5. SECURITY TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_email_security.py
    ├── test_template_injection_prevention()
    ├── test_email_content_sanitization()
    ├── test_tls_connection_enforced()
    └── test_no_sensitive_data_in_logs()

TARGET COVERAGE:
- Overall: > 80%
- Domain Layer: > 95%
- Application Layer: > 90%
- Infrastructure Layer: > 75%
"""
```

## Complete Analysis Checklist

Before starting any implementation, check:

### Understanding
- [ ] Objective clearly defined and documented
- [ ] Acceptance criteria listed
- [ ] Technical constraints identified
- [ ] Business context understood

### Exploration
- [ ] Similar code identified and analyzed
- [ ] Current architecture documented
- [ ] Project patterns identified
- [ ] Existing dependencies listed

### Impact
- [ ] Impact matrix created
- [ ] Affected modules listed
- [ ] Side effects identified
- [ ] Necessary migrations planned

### Design
- [ ] Solution architecture defined
- [ ] Data flow documented
- [ ] Technical choices justified
- [ ] Alternatives evaluated

### Planning
- [ ] Tasks broken down into atomic steps
- [ ] Implementation order defined
- [ ] Estimation completed with buffer
- [ ] Task dependencies identified

### Risks
- [ ] Risks identified and evaluated
- [ ] Mitigation plans defined
- [ ] Monitoring planned
- [ ] Fallbacks planned

### Tests
- [ ] Testing strategy defined
- [ ] Unit tests planned
- [ ] Integration tests planned
- [ ] E2E tests planned
- [ ] Target coverage defined

## Documentation Templates

### Template: Feature Analysis

```markdown
# Analysis: [Feature Name]

## 1. Need
### Objective
[Clear description of the objective]

### Business Context
[Business context and users]

### Constraints
- Performance: [constraints]
- Security: [constraints]
- Scalability: [constraints]

### Acceptance Criteria
1. [Criterion 1]
2. [Criterion 2]

## 2. Existing Code
### Identified Patterns
[List of similar patterns]

### Current Architecture
[Architecture description]

### Project Standards
[Conventions and standards]

## 3. Impact
[Impact matrix]

## 4. Solution
### Architecture
[Diagrams and description]

### Data Flow
[Flow description]

### Technical Choices
[Choice justification]

## 5. Implementation
### Plan
[Ordered task list]

### Estimation
[Estimation with buffer]

## 6. Risks
[List of risks and mitigations]

## 7. Tests
[Detailed testing strategy]
```

### Template: Bug Analysis

```markdown
# Bug Analysis: [Bug Title]

## 1. Symptoms
### Description
[What is not working]

### Reproduction
1. [Step 1]
2. [Step 2]

### Expected vs Actual Behavior
- Expected: [behavior]
- Actual: [behavior]

## 2. Investigation
### Logs & Stack Trace
\`\`\`
[Stack trace]
\`\`\`

### Affected Code
[Files and lines]

### Hypotheses
1. [Hypothesis 1]
2. [Hypothesis 2]

## 3. Root Cause
[Cause explanation]

## 4. Solution
### Proposed Fix
[Fix description]

### Impact
[Affected modules]

### Risks
[Fix risks]

## 5. Tests
### Non-Regression Tests
[Test list]

### Validation
[How to validate the fix]
```

## Conclusion

Preliminary analysis is not a waste of time, it's an **investment**.

**Benefits:**
- Reduces design errors
- Avoids costly refactoring
- Improves code quality
- Facilitates review
- Speeds up implementation
- Reduces technical debt

**Golden Rule:**
> Spending 20% of time on analysis saves 50% of total time.

**Example:**
- Estimated feature: 40h
- With analysis (8h): 32h implementation = **40h total**
- Without analysis: 60h implementation (bugs, refactoring, misunderstandings) = **60h total**
- **Gain: 20h (33%)**
