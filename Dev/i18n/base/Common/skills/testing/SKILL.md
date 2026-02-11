---
name: testing
description: TDD/BDD testing principles, test patterns, and coverage strategies
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
model: opus
triggers:
  files:
    - "*Test.php"
    - "*_test.py"
    - "*.spec.ts"
    - "*.spec.tsx"
    - "*.test.ts"
    - "*.test.tsx"
    - "*_test.dart"
    - "*_test.go"
    - "**/__tests__/**"
    - "**/tests/**"
  keywords:
    - test
    - TDD
    - BDD
    - coverage
    - mock
    - stub
    - fixture
    - assertion
    - PHPUnit
    - Jest
    - pytest
    - xUnit
---

# Testing - Principes TDD/BDD

This skill provides guidelines and best practices.

See ../../rules/07-testing.md for detailed documentation.
