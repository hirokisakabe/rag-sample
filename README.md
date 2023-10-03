# rag-sample

RAG（Retrieval Augmented Generation）を OpenAI と Elasticsearch で試すサンプル

```bash
# Elasticsearchを起動する
docker run -p 9200:9200 -it -m 2GB -e xpack.security.enabled=false -e discovery.type=single-node docker.elastic.co/elasticsearch/elasticsearch:8.10.2

# Elasticsearchにデータを投入する
npm run load

# Next.jsを起動する
npm run dev
```
