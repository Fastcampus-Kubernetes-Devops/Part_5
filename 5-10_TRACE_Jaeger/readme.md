### fastcampus Part 5-10 TRACE Jaeger
## Prerequisite, Cert-manager 구성(필수)
```
# Cert-manager Helm repo 등록 및 설치
helm repo add jetstack https://charts.jetstack.io --force-update
helm repo update

helm upgrade --install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set webhook.hostNetwork=true --set webhook.securePort=10260 --set installCRDs=true
```

## Jaeger Operator 구성
```
# Jaeger Operator Helm repo 등록 및 설치
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm repo update

helm search repo jaegertracing

helm upgrade --install jaeger-operator jaegertracing/jaeger-operator --namespace jaeger --create-namespace --set rbac.clusterRole=true --set hostNetwork=true
```

## Jaeger Collector 구성 
```
# Jaeger Collector All in one 방식 구성
kubectl apply -n jaeger -f valuse_allinone.yaml

# Jaeger Collector Product 방식 구성
kubectl apply -n jaeger -f values_production.yaml

# Jaeger CR 상의버그 처리, "kubectl describe clusterrole jaeger-operator" 로 확인하였을때, 아래의 내용이 누락되어있으면 추가
kubectl edit clusterrole jaeger-operator

...
- apiGroups:
  - networking.k8s.io
  resources:
  - ingressclasses
  verbs:
  - create
  - delete
  - get
  - list
  - patch
  - update
  - watch


```

## Jaeger Query 구성
```
# Jaeger Sample App HotROD 배포
kubectl apply -f hotrod.yaml -n jaeger
```

## Opentelemetry Jaeger 연동 
```
# instrumentation 구성 (통합)
kubectl apply -n jaeger -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: instrumentation
spec:
  exporter:
    endpoint: http://otel-simplest-collector.otel.svc.local.cluster:4317
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF

# Bookinfo Sample App 설치
kubectl apply -f samples/bookinfo/platform/kube/bookinfo.yaml -n jaeger

# opentelemetrycollector CR 의 Exporter 추가 및 Service.pipeline 에 적용, Openlens 에서 수정 추천
kubectl edit opentelemetrycollector -n otel otel-simplest

...
spec:
  config:
    exporters:
### 추가할부분 Start ###
      otlp/jaeger:
        endpoint: jaeger-prod-collector.jaeger.svc.local.cluster:4317
        tls:
          insecure: true
          insecure_skip_verify: true
### END ###
    receivers:
      otlp:
        protocols:
          grpc: null
          http: null
    service:
      pipelines:
        traces:
          exporters:
          - otlp/jaeger
          processors: []
          receivers:
          - otlp
...


```