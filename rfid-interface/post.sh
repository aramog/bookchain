#!/bin/bash
# MAKES A POST REQUEST TO EXTERNAL ADAPTER
curl --header "Content-Type: application/json" \
	--request POST \
	--data '{"id":"278c97ffadb54a5bbb93cfec5f7b5503", "data":{"timeout": 10}}' \
	https://link-adapter.loca.lt
