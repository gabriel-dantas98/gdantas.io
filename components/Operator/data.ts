// Tools que rodam no marquee — mix CNCF + observability + AI ops.
export const PLATFORM_TOOLS = [
	'kubernetes', 'helm', 'argocd', 'fluxcd', 'prometheus', 'grafana', 'opentelemetry',
	'jaeger', 'tempo', 'loki', 'envoy', 'istio', 'linkerd', 'cert-manager', 'external-dns',
	'karpenter', 'crossplane', 'backstage.io', 'terraform', 'pulumi', 'vault', 'etcd',
	'kyverno', 'opa', 'tekton', 'spinnaker', 'cilium', 'falco', 'kustomize', 'velero',
	'fluentd', 'thanos', 'cortex', 'keda', 'knative', 'contour', 'traefik', 'rook',
	'ceph', 'minio', 'redis', 'postgresql', 'kafka', 'rabbitmq', 'elasticsearch',
	'opensearch', 'mongodb', 'cockroachdb', 'neo4j', 'clickhouse',
];

// Reduzido pra 24 ícones — corta requests pro cdn.simpleicons.org sem perder a
// vibe CNCF wallpaper do hero.
export const HERO_ICONS = [
	'kubernetes', 'docker', 'helm', 'terraform', 'grafana', 'prometheus',
	'opentelemetry', 'istio', 'vault', 'cilium', 'github', 'githubactions',
	'redis', 'postgresql', 'apachekafka', 'elasticsearch', 'python', 'go',
	'typescript', 'cloudflare', 'nodedotjs', 'anthropic', 'langchain', 'hashicorp',
];

export const TOPICS = [
	'platform engineering', 'backstage', 'idp', 'kubernetes', 'observability',
	'otel', 'paved roads', 'devex', 'sre', 'sli/slo', 'incident response',
	'go', 'python', 'k8s', 'aws',
];
