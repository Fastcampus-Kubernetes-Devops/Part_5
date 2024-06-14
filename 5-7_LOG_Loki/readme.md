### fastcampus Part 5-7 LOG Loki
## Prometheus-stack 구성 (옵션)
```
# 기존에 Prometheus 및 Grafana 가 구성되어있다면, 기존것 사용해도 무방함
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

kubectl create ns prometheus-stack

# 설치 후 확인
openlens 로 prometheus-stack-kube-prom-prometheus Service Port-forward 를 통해 Web ui 확인
openlens 로 prometheus-stack-grafana Service Port-forward 를 통해 Web ui 확인 admin / prom-operator (Default Password)

```

## Loki 구성
```
# loki-valuse.yaml 에서 s3://$AccessKey:$SecretKey@ap-northeast-2/fastcampus-loki-part5 의 주소 및 AccessKey, SecretKey 수정해서 사용
# 3.0.0 이 최신이나, 모든 어플리케이션은 최신버전은 안정성이 떨어지기에, App version 2.9.x 최신버전인 helm chart 5.47.2 버전으로 구성

helm upgrade --install -n loki loki grafana/loki -f loki-valuse.yaml --version 5.47.2
```

## Promtail 구성 
```
# Promtail Helm 설치
helm upgrade --install -n loki promtail grafana/promtail -f promtail-valuse.yaml
```
