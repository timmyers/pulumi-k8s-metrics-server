# pulumi-k8s-metrics-server

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
