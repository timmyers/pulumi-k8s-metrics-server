import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as kubeTypes from '@pulumi/kubernetes/types/input'

export interface RbacArgs {
  name: string;
  namespace: string;
  defaultOptions: pulumi.CustomResourceOptions
}

export default (args: RbacArgs) => {
  const name = args.name;

  const serviceAccount = new k8s.core.v1.ServiceAccount(`${name}-serviceaccount`, {
    metadata: {
      name: 'metrics-server',
      labels: {
        app: name,
      }
    }
  }, args.defaultOptions)

  const roleBinding = new k8s.rbac.v1.RoleBinding(`${name}-rolebinding`, {
    metadata: {
      namespace: args.namespace,
      labels: {
        app: name,
      }
    },
    roleRef: {
      apiGroup: 'rbac.authorization.k8s.io',
      kind: 'Role',
      name: 'extension-apiserver-authentication-reader',
    },
    subjects: [{
      kind: 'ServiceAccount',
      name: serviceAccount.metadata.name,
      namespace: args.namespace,
    }],
  }, args.defaultOptions);

}