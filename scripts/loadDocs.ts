import { TextLoader } from "langchain/document_loaders/fs/text";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ElasticVectorSearch } from "langchain/vectorstores/elasticsearch";
import { Client } from "@elastic/elasticsearch";

const embeddings = new OpenAIEmbeddings();
const vectorStore = new ElasticVectorSearch(embeddings, {
  client: new Client({ node: "http://localhost:9200" }),
  indexName: "sample_index",
});

async function loadDocument(textFilePath: string) {
  // データをテキストファイルから読み込む
  const loader = new TextLoader(textFilePath);
  const docs = await loader.load();

  // データを分割する
  const splitter = new CharacterTextSplitter({
    chunkSize: 7,
    chunkOverlap: 3,
  });
  const splitDocs = await splitter.splitDocuments(docs);

  console.log("Split documents", splitDocs);

  // データをElasticsearchに投入する
  const ids = await vectorStore.addDocuments(
    splitDocs.map((d) => ({
      pageContent: d.pageContent,
      metadata: { source: d.metadata.source },
    }))
  );

  console.log("Added documents", ids);
  console.info("Loaded documents", textFilePath);
}

const main = async () => {
  await loadDocument("./data/example_1.txt");
  await loadDocument("./data/example_2.txt");
  await loadDocument("./data/example_3.txt");
};

main();
