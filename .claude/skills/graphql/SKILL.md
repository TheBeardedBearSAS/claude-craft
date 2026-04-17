---
name: graphql
description: GraphQL API design, Apollo Federation, schema stitching, resolvers, N+1 query problem. Use when implementing GraphQL API, federation, or optimizing queries.
triggers:
  files: ["**/graphql/**", "**/*.graphql", "**/*.gql", "**/schema.gql"]
  keywords: ["graphql", "apollo", "federation", "schema stitching", "resolver", "dataloader", "n+1", "query", "mutation", "subscription"]
auto_suggest: true
---

# GraphQL — Apollo Federation, Schema Design

API GraphQL moderne avec federation, DataLoader, optimisations.

## GraphQL vs REST

**GraphQL** — 1 query sur-mesure, no versioning, introspection auto  
**REST** — Multiple endpoints, over-fetching, v1/v2/v3

## Apollo Federation

```graphql
# Users service
type User @key(fields: "id") { id: ID!, name: String! }

# Orders service
extend type User @key(fields: "id") {
  id: ID! @external
  orders: [Order!]!
}
```

Gateway compose automatiquement les services.

## N+1 Problem — DataLoader

```javascript
// ❌ N+1 queries
User: { orders: (u) => db.orders.findByUserId(u.id) }

// ✅ DataLoader batch
const loader = new DataLoader(async (ids) => {
  const orders = await db.orders.findByUserIds(ids);
  return ids.map(id => orders.filter(o => o.userId === id));
});
User: { orders: (u) => loader.load(u.id) }
```

## Patterns

### Pagination (Relay)

```graphql
type UserConnection {
  edges: [{ node: User!, cursor: String! }]!
  pageInfo: { hasNextPage: Boolean!, endCursor: String }!
}
```

### Error Handling

```graphql
type CreateUserPayload {
  user: User
  errors: [{ field: String, message: String! }]
}
```

## Optimizations

**DataLoader** — Batch + cache  
**Persisted Queries** — Hash lookup  
**Depth Limiting** — Anti-DoS  
**Cost Analysis** — Query budget

---

Voir `@api-designer` pour design
