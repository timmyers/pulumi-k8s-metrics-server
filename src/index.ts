import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { CustomResourceOptions } from '@pulumi/pulumi';
import deployment from './deployment';
import rbac from './rbac';

export interface MetricsServerArgs {
  rbac: {
    create: boolean; // Enable Role-based authentication
    // pspEnabled: boolean; // Enable pod security policy support
  },
  // deployment: DeploymentArgs;
}

export default class K8sMetricsServer extends pulumi.ComponentResource {
  public constructor(name: string, {
  }: MetricsServerArgs, opts?: pulumi.ComponentResourceOptions) {
    super('k8s:metrics-server', name, { }, opts);

    const defaultOptions: CustomResourceOptions = { parent: this };

    const namespace = 'kube-system';

    deployment({
      name,
      namespace,
      defaultOptions,
      replicas: 1,
      hostNetwork: false,
      annotations: {},
      securityContext: {
        allowPrivilegeEscalation: false,
        capabilities: { drop: ['all'] },
        readOnlyRootFilesystem: true,
        runAsGroup: 10001,
        runAsNonRoot: true,
        runAsUser: 10001,
      },
      image: {
        repository: 'gcr.io/google_containers/metrics-server-amd64',
        tag: 'v0.3.2',
      },
    });

    rbac({
      name,
      namespace,
      defaultOptions,
    });
  }
};