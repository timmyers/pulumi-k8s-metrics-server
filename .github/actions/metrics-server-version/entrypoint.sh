#!/bin/sh -l

curl https://api.github.com/repos/kubernetes-incubator/metrics-server/releases | jq '.[0].tag_name'
