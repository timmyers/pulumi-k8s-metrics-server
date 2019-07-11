
import K8sMetricsServer from '../src';

test('Host network is disabled by default', () => {
  const server = new K8sMetricsServer('metrics-server', {});

  server.deployment.spec.template.spec.hostNetwork.apply(hostNetwork => {
    expect(hostNetwork).toBe(false);
  });
});

test('Host network setting works as expected', () => {
  const server = new K8sMetricsServer('metrics-server', {
    hostNetwork: { enabled: true },
  });

  server.deployment.spec.template.spec.hostNetwork.apply(hostNetwork => {
    expect(hostNetwork).toBe(true);
  });
});

test('Pod disruption budget is disabled by default', () => {
  const server = new K8sMetricsServer('metrics-server', {});

  expect(server.podDisruptionBudget).toBeUndefined()
});

test('Pod disruption budget setting works as expected', () => {
  const MIN_AVAILABLE = 1;
  const server = new K8sMetricsServer('metrics-server', {
    podDisruptionBudget: {
      enabled: true,
      config: {
        spec: {
          minAvailable: MIN_AVAILABLE,
        },
      },
    },
  });

  expect(server.podDisruptionBudget).toBeDefined()
  server.podDisruptionBudget.spec.minAvailable.apply(minAvailable => {
    expect(minAvailable).toBe(MIN_AVAILABLE);
  })
});

test('Image details will default', () => {
  const server = new K8sMetricsServer('metrics-server', {
    image: {},
  });

  expect(server.deployment).toBeDefined();
});