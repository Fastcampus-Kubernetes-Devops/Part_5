### fastcampus Part 5-11 TRACE Tempo
## Tempo 배포
```
# Tempo-distributed Helm repo 등록
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm search repo tempo

# Local Storage Type 설치
helm upgrade --install tempo grafana/tempo-distributed --namespace tempo --create-namespace -f ./valuse_localstorage.yaml

# AWS S3 Type 설치 | AWS Accesskey, SecretKey 확인, S3 Bucket 은 Public Access 허용, 파일에서 bucket name 및 accesskey, secretkey 수정해서 사용
helm upgrade --install tempo-object grafana/tempo-distributed --namespace tempo --create-namespace -f ./valuse_objectstorage.yaml


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
