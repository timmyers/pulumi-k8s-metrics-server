import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { CustomResourceOptions } from '@pulumi/pulumi';
import Deployment,  {PodDisruptionBudgetArgs } from './deployment';
import Service from './service';
import Rbac from './rbac';
import Psp from './psp';

export interface MetricsServerArgs {
  rbac?: {
    create?: boolean; // Enable Role-based authentication
    pspEnabled?: boolean; // Enable pod security policy support
  },
  apiService?: {
    create?: boolean;
  },
  hostNetwork?: {
    enabled?: boolean;
  },
  podDisruptionBudget?: PodDisruptionBudgetArgs
  // deployment: DeploymentArgs;
}

const defaults = (args: MetricsServerArgs): MetricsServerArgs => {
  if (args.rbac === undefined) {
    args.rbac = { create: true, pspEnabled: false };
  } else {
    if (args.rbac.create === undefined) args.rbac.create = true;
    if (args.rbac.pspEnabled === undefined) args.rbac.pspEnabled = false;
  }

  if (args.apiService === undefined) {
    args.apiService = { create: true };
  } else {
    if (args.apiService.create === undefined) args.apiService.create = true;
  }

  if (args.hostNetwork === undefined) {
    args.hostNetwork = { enabled: false };
  } else {
    if (args.hostNetwork.enabled === undefined) args.hostNetwork.enabled = false;
  }

  if (args.podDisruptionBudget === undefined) {
    args.podDisruptionBudget = { enabled: false };
  }

  return args;
}

export default class K8sMetricsServer extends pulumi.ComponentResource {
  public deployment: k8s.apps.v1.Deployment;
  public podDisruptionBudget: undefined | k8s.policy.v1beta1.PodDisruptionBudget;

  public constructor(name: string, argsIn: MetricsServerArgs, opts?: pulumi.ComponentResourceOptions) {
    super('k8s:metrics-server', name, { }, opts);

    const defaultOptions: CustomResourceOptions = { parent: this };

    const args = defaults(argsIn);
    const namespace = 'kube-system';

    let rbac: Rbac|undefined = undefined;
    if (args.rbac) {
      if (args.rbac.create) {
        rbac = new Rbac(name, {
          namespace,
          pspEnabled: args.rbac.pspEnabled,
        }, defaultOptions);
      }

      if (args.rbac.pspEnabled) {
        const psp = new Psp(name, {
          namespace,
        }, defaultOptions);
      }
    }

    const deployment = new Deployment(name, {
      namespace,
      replicas: 1,
      hostNetwork: false,
      annotations: {},
      serviceAccountName: rbac ? rbac.serviceAccountName: '',
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
      livenessProbe: {
        httpGet: {
          path: '/healthz',
          port: 'https',
          scheme: 'HTTPS',
        },
        initialDelaySeconds: 20,
      },
      readinessProbe: {
        httpGet: {
          path: '/healthz',
          port: 'https',
          scheme: 'HTTPS',
        },
        initialDelaySeconds: 20,
      },
      podDisruptionBudget: args.podDisruptionBudget,
    }, defaultOptions);

    const service = new Service(name, {
      namespace,
      createApiService: args.apiService && args.apiService.create,
      port: 443,
      type: 'ClusterIP',
    }, defaultOptions);

    // Register outputs
    this.deployment = deployment.deployment;
    this.podDisruptionBudget = deployment.podDisruptionBudget
    this.registerOutputs({
      deployment: this.deployment
    });
  }
};