
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