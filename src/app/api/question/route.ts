import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ElasticVectorSearch } from "langchain/vectorstores/elasticsearch";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { Client } from "@elastic/elasticsearch";
import { type NextRequest } from "next/server";

const embeddings = new OpenAIEmbeddings();
const vectorStore = new ElasticVectorSearch(embeddings, {
  client: new Client({ node: "http://localhost:9200" }),
  indexName: "sample_index",
});

const llm = new OpenAI();

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query) {
    return Response.json({ error: "No query provided" }, { status: 400 });
  }

  // queryに最も類似するデータをElasticsearchから取得する
  const results = await vectorStore.similaritySearch(query, 1);
  const refData = results[0].pageContent;

  // 取得したデータを参考にして、queryに対する解答を生成する
  const prompt = PromptTemplate.fromTemplate(
    `
    Please answer the following question:
    Question: {query}
    If necessary, please refer to the following information.
    Information: {refData}
    Answer in the same language as the question.`
  );
  const formattedPrompt = await prompt.format({
    query,
    refData,
  });
  const answer = await llm.predict(formattedPrompt);

  return Response.json({
    answer,
    ref: refData,
  });
}
