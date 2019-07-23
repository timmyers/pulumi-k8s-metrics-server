
import K8sMetricsServer from '../src';

test('Namespace defaults to kube-system', () => {
  const server = new K8sMetricsServer('metrics-server', {});

  server.service.metadata.namespace.apply(namespace => {
    expect(namespace).toBe('kube-system');
  });
});

test('APIService is created by default', () => {
  const server = new K8sMetricsServer('metrics-server', {});

  expect(server.apiService).toBeDefined();
});

test('APIService option works as expected', () => {
  const server = new K8sMetricsServer('metrics-server', {
    apiService: { create: false },
  });

  expect(server.apiService).toBeUndefined();
});