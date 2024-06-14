### fastcampus Part 5-4 Service Mesh(istio)
## [Istio Setup : istioctl (IstioOperator) 사용방법 확인 및 설치]
```
설치 순서
[Istio Setup : istioctl (IstioOperator) 사용방법 확인 및 설치]
### istio 공식 홈페이지에서 다운로드 (사용되는 버전이 달라 실습시 오류가 발생할 가능성도 있습니다)
curl -L https://istio.io/downloadIstio | sh -

### Github 다운로드
- istio-1.21.0 디렉토리 다운로드 수행

### Commnad 정리
cd istio-1.21.1

kubectl create ns istio-system
./istioctl x precheck
./istioctl install --set profile=demo
./istioctl install --set profile=default
./istioctl uninstall --purge
```

## [Bookinfo 샘플 App 구성]
```
[Bookinfo 샘플 App 구성]
### Bookinfo 설치
kubectl label namespace default istio-injection=enabled
kubectl apply -f samples/bookinfo/platform/kube/bookinfo.yaml

### Bookinfo 확인 (내부)
kubectl get services
kubectl get pods
kubectl exec "$(kubectl get pod -l app=ratings -o jsonpath='{.items[0].metadata.name}')" -c ratings -- curl -sS productpage:9080/productpage | grep -o "<title>.*</title>"

### Bookinfo 외부접속 가능하도록 세팅
kubectl apply -f samples/bookinfo/networking/bookinfo-gateway.yaml
kubectl get gateway.networking.istio.io

### 변수정의
export INGRESS_NAME=istio-ingressgateway
export INGRESS_NS=istio-system

### 변수 확인
kubectl get svc "$INGRESS_NAME" -n "$INGRESS_NS"

### 변수정의[2]
export INGRESS_PORT=$(kubectl -n "$INGRESS_NS" get service "$INGRESS_NAME" -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')
export SECURE_INGRESS_PORT=$(kubectl -n "$INGRESS_NS" get service "$INGRESS_NAME" -o jsonpath='{.spec.ports[?(@.name=="https")].port}')
export TCP_INGRESS_PORT=$(kubectl -n "$INGRESS_NS" get service "$INGRESS_NAME" -o jsonpath='{.spec.ports[?(@.name=="tcp")].port}')

### ingress_host 등록하는 두가지 방법 ###
# IP 로 ingress_host 등록 (추천) 
export INGRESS_HOST=$(kubectl -n "$INGRESS_NS" get service "$INGRESS_NAME" -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# hostname 로 ingress_host 등록
export INGRESS_HOST=$(kubectl -n "$INGRESS_NS" get service "$INGRESS_NAME" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

### 변수정의[3]
export GATEWAY_URL=$INGRESS_HOST:$INGRESS_PORT

### Bookinfo 확인 (외부)
curl -s "http://${GATEWAY_URL}/productpage" | grep -o "<title>.*</title>"

### Destination Rule 설치
kubectl apply -f samples/bookinfo/networking/destination-rule-all.yaml
kubectl get destinationrules -o yaml

### Cleanup
./samples/bookinfo/platform/kube/cleanup.sh
```

## [istio_Observability : Metric]
```
[istio_Observability : Metric]
# Grafana Addon
https://istio.io/latest/docs/ops/integrations/grafana/#option-1-quick-start
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.21/samples/addons/grafana.yaml


# Prometheus Addon
https://istio.io/latest/docs/ops/integrations/prometheus/#option-1-quick-start
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.21/samples/addons/prometheus.yaml
kubectl apply -f samples/bookinfo/networking/bookinfo-gateway.yaml
kubectl apply -f samples/bookinfo/networking/destination-rule-all.yaml


### 준비과정 끝 이후 다음
kubectl -n istio-system get svc prometheus
kubectl -n istio-system get svc grafana

# Grafana 확인 | 해당 명령어로 수행이 안될경우, openlens 의 Service 의 Port-Forward 를 통해서 접속
istioctl dashboard grafana
```
## [istio_Observability : Distributed traces]
```
[istio_Observability : Distributed traces]
ps. 트레픽을 흘려야, Jaeger 에서 Service 에 List 가 보이니, 트레픽을 5-6 번 충분이 흘려주고 1-2분정도대기후 확인

1. Jaeger
# 설치 - https://istio.io/latest/docs/ops/integrations/jaeger/#installation
# Jaeger URL 에 Mesh Config 넣어서, istioctl 재설치 
# Jaeger 설치
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.21/samples/addons/jaeger.yaml

# istio 재설치
./istioctl install --set profile=default --set meshConfig.defaultConfig.tracing.zipkin.address=jaeger-collector.istio-system.svc.cluster.local:9411 --set meshConfig.defaultConfig.tracing.sampling=100 

# 테스트 레퍼런스
https://istio.io/latest/docs/tasks/observability/distributed-tracing/jaeger/


2. Zipkin 설치 - https://istio.io/latest/docs/ops/integrations/zipkin/#installation
# Zipkin 설치
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.21/samples/addons/extras/zipkin.yaml

# istio 재설치
./istioctl install --set profile=default --set meshConfig.defaultConfig.tracing.zipkin.address=zipkin.istio-system.svc.cluster.local:9411 --set meshConfig.defaultConfig.tracing.sampling=100 

# zipkin dashboard 확인 | 해당 명령어로 수행이 안될경우, openlens 의 Service 의 Port-Forward 를 통해서 접속
./istioctl dashboard zipkin

확인정도만 수행

./istioctl install --set profile=default --set meshConfig.defaultConfig.tracing.zipkin.address=zipkin.istio-system.svc.cluster.local:9411 --set meshConfig.defaultConfig.tracing.sampling=100 --set meshConfig.accessLogFile=/dev/stdout

  meshConfig:
    accessLogFile: /dev/stdout

```

## 트레픽 발생
```
sh send-request.sh

# 위의 스크립트는 $GATEWAY_URL 변수가 중요하며, 해당 변수 적용이 어려울경우 

export INGRESS_HOST=$(kubectl -n "$INGRESS_NS" get service "$INGRESS_NAME" -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
export INGRESS_PORT=$(kubectl -n "$INGRESS_NS" get service "$INGRESS_NAME" -o jsonpath='{.spec.ports[?(@.name=="http2")].port}')
export GATEWAY_URL=$INGRESS_HOST:$INGRESS_PORT

위의 환경변수에 해당되는 IP:Port 를 직접 입력하여 사용
ex) 
for i in $(seq 1 100); do curl -s -o /dev/null "http://$GATEWAY_URL/productpage"; done
->
for i in $(seq 1 100); do curl -s -o /dev/null "http://192.168.10.12:80/productpage"; done

# 위의 스크립트로 발생되는 Request 는 100번의 요청을 특졍 URL 로 보냄

```