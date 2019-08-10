# Crypto Analysis

This application visualizes Bitcoin volumes on various exchange over the last year.

## Configuration

```yaml
---
kind: application
metadata:
  name: Crypto Analysis
  description: Visualisation of Crypto Exchange
spec:
  url: https://reactive-os-examples.github.io/crypto-analysis/
  window:
    autoHideMenuBar: true
    backgroundColor: "#1d1d26"
    title: Crypto Analysis
    titleBarStyle: hidden
```

## Quick Start

Install dependencies and start the application.

```bash
npm ci
npm start
```

## Building from source

To install all dependencies and build run:

```bash
git clone https://github.com/desktop-examples/crypto-analysis.git
cd core
npm ci
npm run build
```
