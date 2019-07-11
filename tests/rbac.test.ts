
import K8sMetricsServer from '../src';

test('RBAC resources are created by default', () => {
  const server = new K8sMetricsServer('metrics-server', {});

  expect(server.serviceAccount).toBeDefined();
  expect(server.clusterRole).toBeDefined();
});

test('RBAC resources are not created if option is set', () => {
  const server = new K8sMetricsServer('metrics-server', {
    rbac: { create: false },
  });

  expect(server.serviceAccount).toBeUndefined();
  expect(server.clusterRole).toBeUndefined();
});

test('RBAC with psp disabled', () => {
  const server = new K8sMetricsServer('metrics-server', {
    rbac: { pspEnabled: false },
  });

  server.clusterRole.rules.apply(rules => {
    const pspRule = rules.findIndex((rule) => {
      return rule.resources.findIndex(rsc => rsc === 'podsecuritypolicies') !== -1;
    });
    expect(pspRule).toBe(-1);
  })
});

test('RBAC with psp enabled', () => {
  const server = new K8sMetricsServer('metrics-server', {
    rbac: { pspEnabled: true },
  });

  server.clusterRole.rules.apply(rules => {
    const pspRule = rules.findIndex((rule) => {
      return rule.resources.findIndex(rsc => rsc === 'podsecuritypolicies') !== -1;
    });
    expect(pspRule).toBeGreaterThanOrEqual(0);
  })
});