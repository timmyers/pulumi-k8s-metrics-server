<h1 align="center">🍹📈 pulumi-k8s-metrics-server</h1>

[![Actions Status](https://github.com/timmyers/pulumi-k8s-metrics-server/workflows/CI/badge.svg)](https://github.com/timmyers/pulumi-k8s-metrics-server/actions)
[![npm](https://img.shields.io/npm/v/@timmyers/pulumi-k8s-metrics-server.svg?style=popout)](https://www.npmjs.com/package/@timmyers/pulumi-k8s-metrics-server)
[![codecov](https://codecov.io/gh/timmyers/pulumi-k8s-metrics-server/branch/master/graph/badge.svg)](https://codecov.io/gh/timmyers/pulumi-k8s-metrics-server)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=timmyers/pulumi-k8s-metrics-server)](https://dependabot.com)

A [pulumi](https://www.pulumi.com) module for instantiating [Kubernetes Metrics Servers](https://github.com/kubernetes-incubator/metrics-server).

Aims to be a full-featured *pulumi native* alternative to the [helm chart](https://github.com/helm/charts/tree/master/stable/metrics-server). Currently only javascript/typescript are supported.  Other languages may follow.

## Usage

`yarn add @timmyers/pulumi-k8s-metrics-server`

```typescript
import K8sMetricsServer, { MetricsServerArgs } from '@timmyers/pulumi-k8s-metrics-server';

const args: MetricsServerArgs = {};
const metricsServer = new K8sMetricsServer('metrics-server', args);
```

The module exposes an interface `MetricsServerArgs`, which exposes many options that can be set, similar to the helm chart.

## Examples
Instantiate an EKS cluster in multiple AWS regions, and create a `metrics-server` in each.
```typescript
import * as aws from '@pulumi/aws';
import K8sMetricsServer from '@timmyers/pulumi-k8s-metrics-server';

const regions: aws.Region[] = [
  'us-west-2', // Oregon
  'eu-central-1', // Frankfurt
];

regions.forEach((region): void => {
  const provider = new aws.Provider(`provider-${region}`, { region });
  const defaultOpts: pulumi.ComponentResourceOptions = { provider };
  const cluster = new eks.Cluster(`cluster-${region}`, {}, defaultOpts);

  const k8sDefaultOpts = { providers: { kubernetes: cluster.provider } };
  const metricsServer = new K8sMetricsServer(name, {}, k8sDefaultOpts);
});
```

## Development
### Installation
Clone the repo, then:
`yarn`

### Running tests
`yarn test`
