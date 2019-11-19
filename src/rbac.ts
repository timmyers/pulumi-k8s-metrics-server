import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as kubeTypes from '@pulumi/kubernetes/types/input'

export interface RbacArgs {
  namespace: string;
  pspEnabled: boolean;
}

export default class Rbac extends pulumi.ComponentResource {
  public serviceAccount: k8s.core.v1.ServiceAccount;
  public clusterRole: k8s.rbac.v1.ClusterRole;

  public constructor(name: string, args: RbacArgs, opts?: pulumi.ComponentResourceOptions) {
    super('k8s:metrics-server:rbac', name, { }, opts);

    const defaultOptions: pulumi.CustomResourceOptions = { parent: this };

    const clusterRoleRules: kubeTypes.rbac.v1.PolicyRule[] = [{
      apiGroups: [''],
      resources: ['pods', 'nodes', 'nodes/stats'],
      verbs: ['get', 'list', 'watch']
    }];

    if (args.pspEnabled) {
      clusterRoleRules.push({
        apiGroups: ['extensions'],
        resources: ['podsecuritypolicies'],
        resourceNames: ['priviledged-metrics-server'],
        verbs: ['use'],
      });
    }

    this.clusterRole = new k8s.rbac.v1.ClusterRole(name, {
      metadata: {
        name: 'system:metrics-server',
        labels: {
          app: name,
        }
      },
      rules: clusterRoleRules,
    }, {
      ...defaultOptions,
      aliases: [{ name: `${name}-clusterRole`}],
    });

    const aggregatedMetricsReaderClusterRole = new k8s.rbac.v1.ClusterRole(`${name}-aggregated`, {
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
    }, {
      ...defaultOptions,
      aliases: [{ name: `${name}-aggregatedMetricsReaderClusterRole`}],
    });

    this.serviceAccount = new k8s.core.v1.ServiceAccount(name, {
      metadata: {
        name: 'metrics-server',
        namespace: args.namespace,
        labels: {
          app: name,
        }
      },
    }, {
      ...defaultOptions,
      aliases: [{ name: `${name}-serviceAccount`}],
    });

    const clusterRoleBinding = new k8s.rbac.v1.ClusterRoleBinding(name, {
      metadata: {
        namespace: args.namespace,
        labels: {
          app: name,
        }
      },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'ClusterRole',
        name: this.clusterRole.metadata.name,
      },
      subjects: [{
        kind: 'ServiceAccount',
        name: this.serviceAccount.metadata.name,
        namespace: args.namespace,
      }]
    }, {
      ...defaultOptions,
      aliases: [{ name: `${name}-clusterrolebinding`}],
    });

    const authDelegatorClusterRoleBinding = new k8s.rbac.v1.ClusterRoleBinding(`${name}-auth`, {
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
        name: this.serviceAccount.metadata.name,
        namespace: args.namespace,
      }]
    }, {
      ...defaultOptions,
      aliases: [{ name: `${name}-authDelegatorClusterRoleBinding`}],
    });

    const roleBinding = new k8s.rbac.v1.RoleBinding(name, {
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
        name: this.serviceAccount.metadata.name,
        namespace: args.namespace,
      }],
    }, {
      ...defaultOptions,
      aliases: [{ name: `${name}-rolebinding`}],
    });

    this.registerOutputs({
      serviceAccount: this.serviceAccount,
      clusterRole: this.clusterRole,
    });
  }
}