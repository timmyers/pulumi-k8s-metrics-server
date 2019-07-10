import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

export interface ApiServiceArgs {
  namespace: pulumi.Input<string>;
}

export default class ApiService extends pulumi.ComponentResource {
  public constructor(name: string, args: ApiServiceArgs, opts?: pulumi.ComponentResourceOptions) {
    super('k8s:metrics-server:api-service', name, { }, opts);

    const defaultOptions: pulumi.CustomResourceOptions = { parent: this };

    const apiService = new k8s.apiregistration.v1beta1.APIService(`${name}-apiService`, {
      metadata: {
        name: 'v1beta1.metrics.k8s.io',
        labels: {
          app: name,
        }
      },
      spec: {
        service: {
          name: service.metadata.name,
          namespace: args.namespace,
        },
        group: 'metrics.k8s.io',
        version: 'v1beta1',
        insecureSkipTLSVerify: true,
        groupPriorityMinimum: 100,
        versionPriority: 100,
      },
    }, defaultOptions);
  }
}