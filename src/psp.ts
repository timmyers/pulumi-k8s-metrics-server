import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

export interface PspArgs {
  namespace: pulumi.Input<string>;
}

export default class Psp extends pulumi.ComponentResource {
  public constructor(name: string, args: PspArgs, opts?: pulumi.ComponentResourceOptions) {
    super('k8s:metrics-server:psp', name, { }, opts);

    const defaultOptions: pulumi.CustomResourceOptions = { parent: this };

    const psp = new k8s.extensions.v1beta1.PodSecurityPolicy(name, {
      metadata: {
        name: 'priviledged-metrics-server',
        namespace: args.namespace,
      },
      spec: {
        allowedCapabilities: ['*'],
        fsGroup: {
          rule: 'RunAsAny',
        },
        privileged: true,
        runAsUser: {
          rule: 'RunAsAny',
        },
        seLinux: {
          rule: 'RunAsAny',
        },
        supplementalGroups: {
          rule: 'RunAsAny',
        },
        volumes: ['*'],
        hostPID: true,
        hostIPC: true,
        hostNetwork: true,
        hostPorts: [{
          min: 1,
          max: 65536,
        }],
      },
    }, defaultOptions);
  }
}