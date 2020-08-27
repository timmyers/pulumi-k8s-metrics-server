import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as kubeTypes from '@pulumi/kubernetes/types/input'
import { CustomResourceOptions } from '@pulumi/pulumi';
import Deployment,  {PodDisruptionBudgetArgs } from './deployment';
import Service from './service';
import Rbac from './rbac';
import Psp from './psp';

export interface MetricsServerArgs {
  namespace?: string;
  rbac?: {
    create?: boolean; // Enable Role-based authentication
    pspEnabled?: boolean; // Enable pod security policy support
  };
  apiService?: {
    create?: boolean;
  };
  hostNetwork?: {
    enabled?: boolean;
  };
  podDisruptionBudget?: PodDisruptionBudgetArgs;
  image?:  {
    repository?: string;
    tag?: string;
    pullPolicy?: string;
  };
  replicas?: number;
  livenessProbe?: kubeTypes.core.v1.Probe;
  readinessProbe?: kubeTypes.core.v1.Probe;
  securityContext?: kubeTypes.core.v1.SecurityContext;
  command?: pulumi.Input<pulumi.Input<string>[]>;
  resources?: pulumi.Input<kubeTypes.core.v1.ResourceRequirements>
  // deployment: DeploymentArgs;
}

const defaults = (args: MetricsServerArgs): MetricsServerArgs => {
  if (args.namespace === undefined) {
    args.namespace = 'kube-system';
  }

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

  const metricsServerImageTag = 'v0.3.7';

  if (args.image === undefined) {
    args.image = { 
      repository: 'gcr.io/google_containers/metrics-server-amd64',
      tag: metricsServerImageTag,
      pullPolicy: 'IfNotPresent',
    }
  } else {
    if (args.image.repository === undefined) args.image.repository = 'gcr.io/google_containers/metrics-server-amd64';
    if (args.image.tag === undefined) args.image.tag = metricsServerImageTag;
    if (args.image.pullPolicy === undefined) args.image.pullPolicy = 'IfNotPresent';
  }

  if (args.replicas === undefined) {
    args.replicas = 1;
  }

  if (args.livenessProbe === undefined) {
    args.livenessProbe = {
      httpGet: {
        path: '/healthz',
        port: 'https',
        scheme: 'HTTPS',
      },
      initialDelaySeconds: 20,
    };
  }

  if (args.readinessProbe === undefined) {
    args.readinessProbe = {
      httpGet: {
        path: '/healthz',
        port: 'https',
        scheme: 'HTTPS',
      },
      initialDelaySeconds: 20,
    };
  }

  if (args.securityContext === undefined) {
    args.securityContext = {
      allowPrivilegeEscalation: false,
      capabilities: { drop: ['all'] },
      readOnlyRootFilesystem: true,
      runAsGroup: 10001,
      runAsNonRoot: true,
      runAsUser: 10001,
    };
  }

  return args;
}

export default class K8sMetricsServer extends pulumi.ComponentResource {
  public deployment: k8s.apps.v1.Deployment;
  public podDisruptionBudget: undefined | k8s.policy.v1beta1.PodDisruptionBudget;
  public service: k8s.core.v1.Service;
  public apiService: undefined | k8s.apiregistration.v1beta1.APIService;
  public serviceAccount: undefined | k8s.core.v1.ServiceAccount;
  public clusterRole: undefined | k8s.rbac.v1.ClusterRole;

  public constructor(name: string, argsIn: MetricsServerArgs, opts?: pulumi.ComponentResourceOptions) {
    super('k8s:metrics-server', name, { }, opts);

    const defaultOptions: CustomResourceOptions = { parent: this };

    const args = defaults(argsIn);

    let rbac: Rbac|undefined = undefined;
    if (args.rbac) {
      if (args.rbac.create) {
        rbac = new Rbac(name, {
          namespace: args.namespace,
          pspEnabled: args.rbac.pspEnabled,
        }, defaultOptions);
      }

      if (args.rbac.pspEnabled) {
        const psp = new Psp(name, {
          namespace: args.namespace,
        }, defaultOptions);
      }
    }

    const deployment = new Deployment(name, {
      namespace: args.namespace,
      replicas: args.replicas,
      hostNetwork: args.hostNetwork.enabled,
      annotations: {},
      serviceAccountName: rbac ? rbac.serviceAccount.metadata.name: '',
      securityContext: args.securityContext,
      image: {
        repository: args.image.repository,
        tag: args.image.tag,
        pullPolicy: args.image.pullPolicy,
      },
      livenessProbe: args.livenessProbe,
      readinessProbe: args.readinessProbe,
      podDisruptionBudget: args.podDisruptionBudget,
      command: args.command,
      resources: args.resources,
    }, defaultOptions);

    const service = new Service(name, {
      namespace: args.namespace,
      createApiService: args.apiService && args.apiService.create,
      port: 443,
      type: 'ClusterIP',
    }, defaultOptions);

    // Register outputs
    this.deployment = deployment.deployment;
    this.podDisruptionBudget = deployment.podDisruptionBudget
    this.service = service.service;
    this.apiService = service.apiService;
    this.serviceAccount = rbac ? rbac.serviceAccount : undefined;
    this.clusterRole = rbac ? rbac.clusterRole : undefined;

    this.registerOutputs({
      deployment: this.deployment,
      podDisruptionBudget: this.podDisruptionBudget,
      service: this.service,
      apiService: this.apiService,
      serviceAccount: this.serviceAccount,
      clusterRole: this.clusterRole,
    });
  }
};