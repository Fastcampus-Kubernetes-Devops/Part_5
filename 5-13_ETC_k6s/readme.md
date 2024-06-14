### fastcampus Part 5-13 ETC k6s
## k6-operator 설치
```
# k6 Helm repo 등록 및 설치
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm search repo k6

# k6-operator 설치
kubectl create ns k6

helm upgrade --install -n k6 k6 grafana/k6-operator --set namespace.create=false

```

## K6 CR 배포, k6 테스트 수행
```
# 테스트용 JS 을 k8s Configmap 으로 등록
kubectl create -n k6 configmap my-test --from-file=test.js

# K6 TestRun CR 배포
kubectl apply -f test-run.yaml

```
