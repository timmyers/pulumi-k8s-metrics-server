import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as kubeTypes from '@pulumi/kubernetes/types/input'

export interface RbacArgs {
  namespace: string;
}

export default class Rbac extends pulumi.ComponentResource {
  public serviceAccountName: pulumi.Output<string>;

  public constructor(name: string, args: RbacArgs, opts?: pulumi.ComponentResourceOptions) {
    super('k8s:metrics-server:rbac', name, { }, opts);

    const defaultOptions: pulumi.CustomResourceOptions = { parent: this };

    const clusterRole = new k8s.rbac.v1.ClusterRole(`${name}-clusterRole`, {
      metadata: {
        name: 'system:metrics-server',
        labels: {
          app: name,
        }
      },
      rules: [{
        apiGroups: [''],
        resources: ['pods', 'nodes', 'nodes/stats'],
        verbs: ['get', 'list', 'watch']
      }]
    }, defaultOptions);

    const aggregatedMetricsReaderClusterRole = new k8s.rbac.v1.ClusterRole(`${name}-aggregatedMetricsReaderClusterRole`, {
      metadata: {
        name: 'system:metrics-server-aggregated-reader',
        labels: {
          app: name,
          'rbac.authorization.k8s.io/aggregate-to-view': 'true',
          'rbac.authorization.k8s.io/aggregate-to-edit': 'true',
          'rbac.authorization.k8s.io/aggregate-to-admin': 'true',
        },
      },
      rules: [{
        apiGroups: ['metrics.k8s.io'],
        resources: ['pods'],
        verbs: ['get', 'list', 'watch']
      }]
    }, defaultOptions);

    const serviceAccount = new k8s.core.v1.ServiceAccount(`${name}-serviceAccount`, {
      metadata: {
        name: 'metrics-server',
        namespace: args.namespace,
        labels: {
          app: name,
        }
      },
    }, defaultOptions);

    const clusterRoleBinding = new k8s.rbac.v1.ClusterRoleBinding(`${name}-clusterrolebinding`, {
      metadata: {
        namespace: args.namespace,
        labels: {
          app: name,
        }
      },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'ClusterRole',
        name: clusterRole.metadata.name,
      },
      subjects: [{
        kind: 'ServiceAccount',
        name: serviceAccount.metadata.name,
        namespace: args.namespace,
      }]
    }, defaultOptions);

    const authDelegatorClusterRoleBinding = new k8s.rbac.v1.ClusterRoleBinding(`${name}-authDelegatorClusterRoleBinding`, {
      metadata: {
        name: `${name}:system:auth-delegator`,
        namespace: args.namespace,
        labels: {
          app: name,
        }
      },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'ClusterRole',
        name: 'system:auth-delegator',
      },
      subjects: [{
        kind: 'ServiceAccount',
        name: serviceAccount.metadata.name,
        namespace: args.namespace,
      }]
    }, defaultOptions);

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
    }, defaultOptions);

    this.serviceAccountName = serviceAccount.metadata.name;

    this.registerOutputs({
      serviceAccountName: this.serviceAccountName,
    })
  }
}