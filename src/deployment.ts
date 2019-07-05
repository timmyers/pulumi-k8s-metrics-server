import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as kubeTypes from '@pulumi/kubernetes/types/input'

export interface DeploymentArgs {
  name: string; /// Name of the deployment
  namespace: string;
  defaultOptions: pulumi.CustomResourceOptions
  replicas: number;
  annotations: {[key: string]: string};
  // serviceAccountName: string;
  hostNetwork: boolean;
  securityContext: kubeTypes.core.v1.SecurityContext;
  image: {
    repository: string;
    tag: string
  }
}

export default (args: DeploymentArgs) => {
  const name = args.name;

  const deployment = new k8s.apps.v1.Deployment(`${name}-deployment`, {
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
          hostNetwork: args.hostNetwork,
          containers: [{
            name: 'metrics-server',
            securityContext: args.securityContext,
            image: `${args.image.repository}:${args.image.tag}`,
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
  }, args.defaultOptions);
}