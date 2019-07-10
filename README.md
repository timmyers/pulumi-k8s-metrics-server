<h1 align="center">🍹📈 pulumi-k8s-metrics-server</h1>

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm](https://img.shields.io/npm/v/@timmyers/pulumi-k8s-metrics-server.svg?style=popout)](https://www.npmjs.com/package/@timmyers/pulumi-k8s-metrics-server)

A [pulumi](https://www.pulumi.com) module for instantiating [Kubernetes Metrics Servers](https://github.com/kubernetes-incubator/metrics-server).

Aims to be a full-featured *pulumi native* alternative to the [helm chart](https://github.com/helm/charts/tree/master/stable/metrics-server). Currently only javascript/typescript are supported.  Other languages may follow.

## Usage

`yarn add @timmyers/pulumi-k8s-metrics-server`

```typescript
import K8sMetricsServer from '@timmyers/pulumi-k8s-metrics-server';

const metricsServer = new K8sMetricsServer('metrics-server', {
  rbac: { create: true },
});
```

## Development
### Getting Started
Clone the repo, then:
`yarn`

_More coming soon_