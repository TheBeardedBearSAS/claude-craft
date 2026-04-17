---
name: wasm
description: WebAssembly (WASM) integration, WASI, component model, Rust/Go to WASM compilation. Use when implementing WASM modules, browser/edge compute, or polyglot runtime.
triggers:
  files: ["**/*.wasm", "**/wasm/**", "**/*.wat"]
  keywords: ["webassembly", "wasm", "wasi", "component model", "wasm32", "wasm-bindgen", "emscripten", "wasmtime", "wasmer"]
auto_suggest: true
---

# WebAssembly (WASM) — Component Model, WASI

WASM pour performance critique, polyglot runtime, edge computing.

## Use Cases

**Browser** — Crypto, image (Figma, Google Earth)  
**Edge** — Cloudflare Workers, Fastly  
**Server** — Plugins sandboxés (Envoy)  
**Embedded** — IoT, automotive

## Compilation

**Rust** — `wasm-pack` (~50KB, perf)  
**Go** — `GOOS=js GOARCH=wasm` (~2MB)  
**C/C++** — Emscripten (legacy)  
**AssemblyScript** — TypeScript-like

## Rust to WASM

```rust
use wasm_bindgen::prelude::*;
#[wasm_bindgen] pub fn add(a: i32, b: i32) -> i32 { a + b }
```

```bash
wasm-pack build --target web
```

```javascript
import init, { add } from './pkg/wasm.js';
await init(); add(2, 3);
```

## WASI (System Interface)

```bash
rustc --target wasm32-wasi main.rs -o app.wasm
wasmtime app.wasm
```

## Component Model

```wit
interface math { add: func(a: s32, b: s32) -> s32 }
```

Compose Rust/Go/C++ modules typés.

## Edge (Cloudflare)

```javascript
import wasm from './processor.wasm';
export default {
  async fetch(req) {
    const inst = await WebAssembly.instantiate(wasm);
    return new Response(inst.exports.process(req.body));
  }
};
```

## Runtimes

**Wasmtime** — Fast, WASI  
**Wasmer** — Universal  
**WasmEdge** — Edge, K8s

---

Voir `@.claude/skills/edge-computing/SKILL.md`
