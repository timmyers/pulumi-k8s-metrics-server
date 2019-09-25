import K8sMetricsServer, { MetricsServerArgs } from '@timmyers/pulumi-k8s-metrics-server';

const args: MetricsServerArgs = {};
const metricsServer = new K8sMetricsServer('metrics-server', args);
