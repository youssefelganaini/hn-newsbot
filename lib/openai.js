const {Configuration, OpenAIApi} = require("openai");

const {OPENAI_API_KEY, OPENAI_ORGANIZATION_ID} = process.env;

const configuration = new Configuration({apiKey: OPENAI_API_KEY, organization: OPENAI_ORGANIZATION_ID});

const openai = new OpenAIApi(configuration);


/**
 * This module consists of two functions which are based on the function askChatGPT(). In general,
 * it provides functionality to call the OpenAI API based on the prompts.
 */


const askChatGPT = async ({prompt}) => {
    try {
        // choose model, send the request with the given prompt
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: prompt}],
        });

        // extract text from response
        const text = completion?.data?.choices?.[0]?.message.content;
        if (!text) return "";

        // replace all newline characters
        const trimmed = text.trim().replace(/^(\n)+/g, "");

        return trimmed;
    } catch (error) {
        console.log(error);
        return "";
    }
};

module.exports.interestingIndexArticle = async ({content}) => {
    /**
     * Use askChatGPT() with a prompt including
     * 1. the crawled content of the article
     * 2. general information about the business
     * 3. PRIMARY keywords which have to be in the content for the article to have a high index
     * 4. SECONDARY keywords which increase the likelihood of the article to have a high index
     * 5. the goal is to return an index rating + a reasoning behind the rating
     */
    
    try {
        if (!content) return {index: null, reason: "No crawled content"};

        keywords_primary = "[passkeys, webauthn, fido, passwordless, authentication, password]"
        keywords_secondary = "[vue, angular, react, nextjs, svelte, php, node, golang]"
        const prompt = `We are a business called Corbado (corbado.com). It's a startup which adds future-proof, passwordless authentication in <1h to new applications and existing systems. Let your users login with passkeys via Face ID or Touch ID to boost conversion / signup rates, improve UX and increase security. 
        We like articles about: people writing about WebAuthn / passkeys / (passwordless) authentication, competitors in the (passwordless) authentication space, something related to data security benefits of WebAuthn / passkeys, passkey / WebAuthn technical implementation guides or when traditional password-based authentication gets negative press. 
        Some of our competitors are Clerk (clerk.dev), Hanko (hanko.io), OwnID (ownid.com) or Auth0 (auth0.com). Is the following article interesting for us? Reply with a single number between 0 and 100. 0 being not interesting at all, 100 being super interesting. The article MUST include these keywords ${keywords_primary} to have a rating >= 70, even better in combination with ${keywords_secondary}. If ${keywords_primary} are not included, the rating MUST be lower than 70, no exceptions.
        After this number, add a dash (-), following by a short explanation. This is the crawled article:\n\n${content}`;

        const reply = await askChatGPT({prompt});
        if (!reply) return {index: null, reason: "No ChatGPT reply"};

        // extract the index (rating) from the text response
        const index = /^[0-9]+$/.test(reply)
            ? parseInt(reply, 10)
            : reply.match(/^[0-9]+/)?.[0]
                ? parseInt(reply.match(/^[0-9]+/)[0], 10)
                : null;

        // extract the reason from the text response
        const reason = reply.match(/- ?(.*)$/m)?.[1] || null;

        // return index + reason
        return {index, reason};
    } catch (error) {
        console.log(error);
        return {index: null, reason: error.message};
    }
};

// @Vincent: do we need this function? I feel like its useless because we provide the keywords we are looking for
// and if we don't find them anyways, then it doesn't matter which keywords ChatGPT finds in the article
module.exports.getKeywordsAI = async ({link, content}) => {
    /**
     * Use askChatGPT() with a prompt including
     * 1. the crawled content of the article + (link, which we don't need for now -> might remove)
     * 2. the goal is to return a list of keywords from the article
     */

    try {
        const prompt = `Extract 15 keywords from the content of this URL:\n\n${link}${
            content ? `\n\nContents:\n\n${content}\n\n` : ""
        }`;

        // send request with prompt above
        const reply = await askChatGPT({prompt});
        if (!reply) return [];

        // It returns a list with 1. 2. 3. n.
        if (reply.startsWith("1. ")) {
            return reply
                .split("\n")
                .map((line) =>
                    line
                        .replace(/^[0-9]+\. ?/, "")
                        .replace(/(\n)+/g, " ")
                        .trim()
                        .toLowerCase()
                )
                .filter(Boolean);
        }

        // It returns a comma separated list with 1, 2, 3, n
        return reply
            .replace(/(\n)+/g, " ")
            .split(/, ?/)
            .map((word) => word.trim().toLowerCase());
    } catch (error) {
        console.log(error);
        return [];
    }
};
