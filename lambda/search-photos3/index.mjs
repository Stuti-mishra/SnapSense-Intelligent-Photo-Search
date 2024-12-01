import { Client } from "@opensearch-project/opensearch";

const esClient = new Client({
    node: "https://search-photos-search-a3enfdo3dugpg5ba6msyyctykm.us-east-1.es.amazonaws.com", // Replace with your OpenSearch endpoint
    auth: {
        username: "Stuti", // Replace with your OpenSearch username
        password: "Bingo@1234"  // Replace with your OpenSearch password
    }
});

export const handler = async (event) => {
    try {
        console.log("Lex Event:", JSON.stringify(event, null, 2));

        // Extract slots from the Lex event
        const slots = event.sessionState.intent.slots || {};
        const keyword1 = slots.keyword1?.value?.originalValue;
        const keyword2 = slots.keyword2?.value?.originalValue;

        // Ensure at least one keyword is provided
        if (!keyword1) {
            return {
                sessionState: {
                    ...event.sessionState,
                    dialogAction: {
                        type: "Close",
                    },
                    intent: {
                        name: event.sessionState.intent.name,
                        state: "Failed"
                    }
                },
                messages: [
                    { contentType: "PlainText", content: "Please provide at least one keyword to search." }
                ]
            };
        }

        // Build OpenSearch query
        const keywords = [keyword1];
        if (keyword2) {
            keywords.push(keyword2);
        }

        const query = {
            query: {
                terms: {
                    labels: keywords
                }
            }
        };

        // Execute OpenSearch query
        const searchParams = {
            index: "photos", // Replace with your OpenSearch index
            body: query
        };

        const searchResult = await esClient.search(searchParams);
        console.log("Search results:", JSON.stringify(searchResult.body, null, 2));

        // Extract results
        const hits = searchResult.body.hits.hits || [];
        if (hits.length === 0) {
            return {
                sessionState: {
                    ...event.sessionState,
                    dialogAction: {
                        type: "Close",
                    },
                    intent: {
                        name: event.sessionState.intent.name,
                        state: "Failed"
                    }
                },
                messages: [
                    { contentType: "PlainText", content: `No results found for keywords: ${keywords.join(", ")}` }
                ]
            };
        }

        // Prepare response cards
        const responseCards = hits.map((hit) => {
            const { objectKey, bucket, labels } = hit._source;
            return {
                title: objectKey,
                imageUrl: `https://${bucket}.s3.amazonaws.com/${objectKey}`,
                subtitle: `Labels: ${labels.join(", ")}`
            };
        });

        return {
            sessionState: {
                ...event.sessionState,
                dialogAction: {
                    type: "Close",
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Fulfilled"
                }
            },
            messages: [
                {
                    contentType: "CustomPayload",
                    content: JSON.stringify(responseCards)
                }
            ]
        };
    } catch (error) {
        console.error("Error in Lambda:", error);
        return {
            sessionState: {
                ...event.sessionState,
                dialogAction: {
                    type: "Close",
                },
                intent: {
                    name: event.sessionState.intent.name,
                    state: "Failed"
                }
            },
            messages: [
                { contentType: "PlainText", content: "An error occurred while processing your request." }
            ]
        };
    }
};
