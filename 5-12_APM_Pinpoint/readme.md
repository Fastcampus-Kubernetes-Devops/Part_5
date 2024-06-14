### fastcampus Part 5-12 APM Pinpoint
## Pinpoint Server 구성
```
## Prerequite
# Zookeeper 수동설치
helm upgrade --install -n pinpoint pinpoint-zookeeper bitnami/zookeeper

# HDFS 수동설치, HDFS 설치파일은 Github 에 Upload 하여 제공, github 에서 파일 다운로드
unzip bigdata-charts.zip
cd bigdata-charts/charts/hdfs

helm upgrade --install -n pinpoint pinpoint-hdfs ./

# MySQL 수동설치
kubectl apply -n pinpoint -f mysql.yaml 

kubectl exec -it -n pinpoint mysql-0 -- /bin/bash

$ mysql -u root -p'admin'
mysql> create database pinpoint;
mysql> create user admin@'%' identified by 'admin' ;
mysql> grant all privileges on pinpoint.* to admin@'%' with grant option;
mysql> flush privileges;

# pinpoint 배포
git clone https://github.com/pinpoint-apm/pinpoint-kubernetes.git
cd pinpoint-kubernetes/pinpoint


## valuse.yaml 에서 수정할 부분

zookeeper:
  enabled: true -> false (수정)

hdfs:
  enabled: true -> false (수정)

  ### External zookeeper address (Default : pinpoint-zookeeper)
  zookeeper:  
    host: pinpoint-zookeeper-headless (추가)

pinpoint-collector:
  ### External zookeeper address (Default : pinpoint-zookeeper)
  zookeeper:
    host: pinpoint-zookeeper-headless (추가)


## Chart.yaml 에서 Dependencies 부분 삭제

# Dependecy for Pinpoint
dependencies:
    - name: mysql
      version: 1.6.7
      repository: https://charts.helm.sh/stable
      condition: mysql.enable
    - name: hdfs
      version: ~0.1.8
      repository: https://gradiant.github.io/charts
      condition: hdfs.enabled
    - name: zookeeper
      version: ~2.1.0
      repository: https://charts.helm.sh/incubator
      condition: zookeeper.enabled%  

apiVersion: v2
name: pinpoint
description: A Helm chart for Pinpoint
type: application
# chart version.
version: 0.1.0
# version number of the application being deployed.
appVersion: 2.1.0 -> 2.5.4 수정

## 추가 버전 수정될 부분, grep 으로 검색된 6개의 파일에서 appVersion 및 image.tag 의 버전을 2.5.4 로 수정
❯ grep -r "2.1.0" ./*
./pinpoint-collector/Chart.yaml:appVersion: 2.1.0
./pinpoint-collector/values.yaml:  tag: 2.1.0
./pinpoint-hbase/Chart.yaml:appVersion: 2.1.0
./pinpoint-hbase/values.yaml:  tag: 2.1.0
./pinpoint-web/Chart.yaml:appVersion: 2.1.0
./pinpoint-web/values.yaml:  tag: 2.1.0

## 수정 완료 후 배포
helm upgrade --install -n pinpoint pinpoint -f values.yaml ./

```

## Pinpoint Demo
```
kubectl create ns pinpoint-demo
kubectl apply -f petclinic-agent.yaml

```
