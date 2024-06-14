### fastcampus Part 5-6 Opentelemetry
## Opentelemetry reference
```
 - Opentelemetry Instrumentation 방식(Process, Log, Metric, Tracing) 및 지원하는 Language List, "https://opentelemetry.io/docs/languages/"
 - Opentelemetry API + SDK, manual Instrumentation, "https://opentelemetry.io/docs/concepts/instrumentation/code-based/" 
 - Opentelemetry Auto Instrumentation, "https://opentelemetry.io/docs/concepts/instrumentation/zero-code/"
```

## Opentelemetry Operator 설치
```
# Opentelemetry helm Repo 등록
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo update

# otel Namepsace 생성
kubectl create ns otel

# Certmanger 가 없을경우 "values_selfsign.yaml" Certmanager 가 있을경우 "values_certmanager.yaml" 사용
helm upgrade --install -n otel opentelemetry-operator open-telemetry/opentelemetry-operator -f values_selfsign.yaml 
helm upgrade --install -n otel opentelemetry-operator open-telemetry/opentelemetry-operator -f values_certmanager.yaml

# 설치확인
kubectl -n otel get all
```

## Opentelemetry Colletor 설치
```
# Collector DaemonSet 배포
kubectl apply -n otel -f collector_ds.yaml

# Collector Deploymnet 배포
kubectl apply -n otel -f collector_deploy.yaml

# Collector StatefulSets 배포
kubectl apply -n otel -f collector_sts.yaml

# Collector Sidecar 방식 배포
kubectl apply -n otel -f collector_sidecar.yaml

# Opentelemetry CR 확인
kubectl get OpenTelemetryCollector -n otel
```

## Opentelemetry Auto instrumentation 구성
```
# instrumentation 구성 (Java, Python, Nodejs)
kubectl apply -n otel-bookinfo -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: java-instrumentation
spec:
  exporter:
    endpoint: http://otel-simplest-collector.otel.svc.local.cluster:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF

kubectl apply -n otel-bookinfo -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: node-instrumentation
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

kubectl apply -n otel-bookinfo -f - <<EOF
apiVersion: opentelemetry.io/v1alpha1
kind: Instrumentation
metadata:
  name: python-instrumentation
spec:
  exporter:
    endpoint: http://otel-simplest-collector.otel.svc.local.cluster:4318
  propagators:
    - tracecontext
    - baggage
  sampler:
    type: parentbased_traceidratio
    argument: "1"
EOF

# Opentelemetry instrumentation 설치 확인
kubectl get instrumentation -n otel-bookinfo

# Bookinfo 배포
kubectl apply -f samples/bookinfo/platform/kube/bookinfo.yaml -n otel-bookinfo
```


## DEMO 배포
```
# Opentelmetry Demo Chart 확인
helm search repo opentelemetry-demo

# Opentelmetry Demo 테스트용 Namespace 생성
kubectl create ns otel-demo
kubectl get ns | grep otel-demo

# Opentelmetry Demo Helm 설치
helm upgrade --install -n otel-demo my-otel-demo open-telemetry/opentelemetry-demo -f valuse_demo.yaml

# 실습시 사용한 valuse_demo.yaml 과 공식 chart 와의 차이점 확인
 - OTEL_COLLECTOR_NAME 를 기본값이 아닌 설치된 collector 값으로 변경 필수
    # - name: OTEL_COLLECTOR_NAME
    #   value: '{{ include "otel-demo.name" . }}-otelcol'
    - name: OTEL_COLLECTOR_NAME
      value: otel-demo-collector-collector.default.svc.cluster.local

 - 설치되는 기본옵션값 차이
grafana - endable=true -> false
opensearch - enable=true -> false
prometheus - enable=true -> false
jaeger - enable=true -> false

 - valse_demo.yaml 에서 누락된부분 
opentelemetry-collector:
  config:
    receivers:
      httpcheck/frontendproxy:
        targets:
          - endpoint: 'http://{{ include "otel-demo.name" . }}-frontendproxy:8080'
      redis:
        endpoint: "redis-cart:6379"
        collection_interval: 10s

  flagd:
    env:
      - name: FLAGD_METRICS_EXPORTER
        value: otel
      - name: FLAGD_OTEL_COLLECTOR_URI
        value: $(OTEL_COLLECTOR_NAME):4317

  imageprovider:
    enabled: true
    useDefault:
      env: true
    service:
      port: 8081
    env:
      - name: IMAGE_PROVIDER_PORT
        value: "8081"
      - name: OTEL_COLLECTOR_PORT_GRPC
        value: "4317"
      - name: OTEL_COLLECTOR_HOST
        value: $(OTEL_COLLECTOR_NAME)
    resources:
      limits:
        memory: 50Mi

  frontendProxy:
    env:
      - name: IMAGE_PROVIDER_HOST
        value: '{{ include "otel-demo.name" . }}-imageprovider'
      - name: IMAGE_PROVIDER_PORT
        value: "8081"
      - name: FLAGD_HOST
        value: '{{ include "otel-demo.name" . }}-flagd'
      - name: FLAGD_PORT
        value: "8013"

  frontend:
    env:
      - name: FLAGD_HOST
        value: '{{ include "otel-demo.name" . }}-flagd'
      - name: FLAGD_PORT
        value: "8013"

 - 

```






