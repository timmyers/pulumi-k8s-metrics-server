import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

export interface ServiceArgs {
  namespace: pulumi.Input<string>;
  createApiService: pulumi.Input<boolean>;
  port: pulumi.Input<number>;
  type: pulumi.Input<string>;
}

export default class Service extends pulumi.ComponentResource {
  public service: k8s.core.v1.Service;
  public apiService: undefined | k8s.apiregistration.v1beta1.APIService;

  public constructor(name: string, args: ServiceArgs, opts?: pulumi.ComponentResourceOptions) {
    super('k8s:metrics-server:service', name, { }, opts);

    const defaultOptions: pulumi.CustomResourceOptions = { parent: this };

    this.service = new k8s.core.v1.Service(name, {
      metadata: {
        namespace: args.namespace,
        labels: {
          app: name,
        }
      },
      spec: {
        ports: [{
          port: args.port,
          protocol: 'TCP',
          targetPort: 'https'
        }],
        selector: {
          app: name,
        },
        type: args.type,
      },
    }, defaultOptions);

    if (args.createApiService) {
      this.apiService = new k8s.apiregistration.v1beta1.APIService(name, {
        metadata: {
          name: 'v1beta1.metrics.k8s.io',
          labels: {
            app: name,
          }
        },
        spec: {
          service: {
            name: this.service.metadata.name,
            namespace: args.namespace,
          },
          group: 'metrics.k8s.io',
          version: 'v1beta1',
          insecureSkipTLSVerify: true,
          groupPriorityMinimum: 100,
          versionPriority: 100,
        },
      }, {
        ...defaultOptions,
        deleteBeforeReplace: true,
      });
    } else {
      this.apiService = undefined;
    }

    this.registerOutputs({
      service: this.service,
      apiService: this.apiService,
    });
  }
}