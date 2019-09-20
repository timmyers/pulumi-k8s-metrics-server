import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as kubeTypes from '@pulumi/kubernetes/types/input'

interface PDBDisabled { enabled: false };
interface PDBEnabled { enabled: true, config: kubeTypes.policy.v1beta1.PodDisruptionBudget };

export type PodDisruptionBudgetArgs = PDBDisabled | PDBEnabled;

export interface DeploymentArgs {
  namespace: pulumi.Input<string>;
  replicas: pulumi.Input<number>;
  annotations: pulumi.Input<{[key: string]: string}>;
  serviceAccountName: pulumi.Input<string>;
  hostNetwork: pulumi.Input<boolean>;
  securityContext: kubeTypes.core.v1.SecurityContext;
  livenessProbe: kubeTypes.core.v1.Probe;
  readinessProbe: kubeTypes.core.v1.Probe;
  image: {
    repository: pulumi.Input<string>;
    tag: pulumi.Input<string>;
    pullPolicy: pulumi.Input<string>;
  };
  podDisruptionBudget: PodDisruptionBudgetArgs;
}

export default class Deployment extends pulumi.ComponentResource {
  public deployment: k8s.apps.v1.Deployment;
  public podDisruptionBudget: undefined | k8s.policy.v1beta1.PodDisruptionBudget;

  public constructor(name: string, args: DeploymentArgs, opts?: pulumi.ComponentResourceOptions) {
    super('k8s:metrics-server:deployment', name, { }, opts);

    const defaultOptions: pulumi.CustomResourceOptions = { parent: this };

    const deployment = new k8s.apps.v1.Deployment(`metrics-server-${name}`, {
      metadata: {
        namespace: args.namespace,
        labels: {
          app: name,
        },
      },
      spec: {
        selector: {
          matchLabels: {
            app: name,
          }
        },
        replicas: args.replicas,
        template: {
          metadata: {
            labels: {
              app: name,
            },
            annotations: args.annotations,
          },
          spec: {
            serviceAccountName: args.serviceAccountName,
            hostNetwork: args.hostNetwork,
            containers: [{
              name: 'metrics-server',
              securityContext: args.securityContext,
              image: `${args.image.repository}:${args.image.tag}`,
              imagePullPolicy: args.image.pullPolicy,
              command: [
                '/metrics-server',
                '--cert-dir=/tmp',
                '--logtostderr',
                '--secure-port=8443',
              ],
              ports: [{
                containerPort: 8443,
                name: 'https'
              }],
              livenessProbe: args.livenessProbe,
              readinessProbe: args.readinessProbe,
              volumeMounts: [{
                name: 'tmp',
                mountPath: '/tmp'
              }],
            }],
            volumes: [{
              name: 'tmp',
              emptyDir: {},
            }]
          },
        },
      }
    }, defaultOptions);

    if (args.podDisruptionBudget.enabled) {
      const pdb = new k8s.policy.v1beta1.PodDisruptionBudget(`${name}-poddisruptionbudget`, 
        args.podDisruptionBudget.config,
        defaultOptions
      );
      this.podDisruptionBudget = pdb;
    } else {
      this.podDisruptionBudget = undefined;
    }

    // Register outputs
    this.deployment = deployment;
    this.registerOutputs({
      deployment: this.deployment,
      podDisruptionBudget: this.podDisruptionBudget,
    });
  }
}