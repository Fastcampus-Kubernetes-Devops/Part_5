### fastcampus Part 5-9 TRACE Zipkin
## Zipkin Server 구성
```
# Zipkin Helm repo 등록 및 설치
helm repo add zipkin https://zipkin.io/zipkin-helm
helm repo update
helm search repo zipkin
kubectl create ns zipkin

# In Memory Type 구성
helm upgrade --install -n zipkin zipkin zipkin/zipkin

# Opensearch Data Store 설정 구성
helm upgrade --install -n zipkin zipkin zipkin/zipkin -f ./values.yaml
```

## Zipkin index 관련하여 Opensearch Dashboard 이슈 관련 처리
```
https://docs.aws.amazon.com/ko_kr/opensearch-service/latest/developerguide/rename.html

Opensearch Dashboard -> Dev tool -> 

PUT /_cluster/settings
{
  "persistent" : {
    "compatibility.override_main_response_version" : true
  }
}

해당 쿼리수행 
```

## Zipkin Sample Application(Brave) 구성 
```
# Brave(Zipkin Java Sample App) kubernetes manifest 배포
kubectl apply -f brave-exam.yaml -n zipkin
```

## opentelemetry Zipkin 연동
```
# Brave(Zipkin Java Sample App & Opentelemetry Auto instrumentation 주석 적용) kubernetes manifest 배포
kubectl apply -f brave-otel.yaml -n zipkin

# opentelemetrycollector CR 의 Exporter 추가 및 Service.pipeline 에 적용, Openlens 에서 수정 추천
kubectl edit opentelemetrycollector -n otel otel-simplest

...
spec:
  config:
    exporters:
      otlp/zipkin:
        endpoint: zipkin.zipkin.svc.cluster.local:9411
        tls:
          insecure: true
          insecure_skip_verify: true
    receivers:
      otlp:
        protocols:
          grpc: null
          http: null
    service:
      pipelines:
        traces:
          exporters:
          - otlp/zipkin
          processors: []
          receivers:
          - otlp
...

```