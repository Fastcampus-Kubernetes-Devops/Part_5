### fastcampus Part 5-8 LOG Opensearch
## Opensearch 구성
```
# Opensearch Helm repo 등록 및 설치
helm repo add opensearch https://opensearch-project.github.io/helm-charts/
helm repo update

helm upgrade --install -n opensearch opensearch opensearch/opensearch --version 2.19.0 -f prod-valuse.yaml --create-namespace 
```

## FluentBit 구성
```
# fluentBit Helm repo 등록 및 설치
helm repo add fluent https://fluent.github.io/helm-charts
helm repo update

helm upgrade --install -n opensearch fluent-bit fluent/fluent-bit -f fluentbit-valuse.yaml

```

## Opensearch Dashboard 구성 
```
# Opensearch Dashboard Helm 설치
helm upgrade --install -n opensearch opensearch-dashboards opensearch/opensearch-dashboards --version 2.17.0 -f dashboard-valuse.yaml
```
