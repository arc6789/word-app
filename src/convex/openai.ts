"use node";
import { OpenAI } from "openai";
import { internalAction, action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { createApi } from 'unsplash-js';
import fetch from 'node-fetch';
import {extractValues, parseOpenAiInputToArray, isOver24Hours, isOver5Minutes} from "./services";

const apiKeyOpenai = process.env.OPENAI_API_KEY!;
const apiKeyUnsplash = process.env.REACT_APP_UNSPLASH_API_KEY!;
const apiKeyDictElementary = process.env.REACT_APP_DICTIONARY_ELEMENTARY_API_KEY!;
const apiKeyDictSchool = process.env.REACT_APP_DICTIONARY_SCHOOL_API_KEY!;

const apiKeys = [
    { key: apiKeyOpenai, name: 'OPENAI_API_KEY' },
    { key: apiKeyUnsplash, name: 'UNSPLASH_API_KEY' },
    { key: apiKeyDictElementary, name: 'DICTIONARY_ELEMENTARY_API_KEY' },
    { key: apiKeyDictSchool, name: 'DICTIONARY_SCHOOL_API_KEY' }
];

const checkApiKeyExistence = (apiKeys:{ key: string | undefined; name: string }[]):void => {
    const missingKeys = apiKeys.filter(({ key, name }) => {
      if (!key) {
        console.error(
          `Missing ${name} in environment variables.\n` +
          "Set it in the project settings in the Convex dashboard:\n" +
          "    npx convex dashboard\n or https://dashboard.convex.dev"
        );
        return true;
      }
      return false;
    });
  
    if (missingKeys.length > 0) {
      throw new Error("One or more required API keys are missing.");
    }
}

checkApiKeyExistence(apiKeys);

// Initialize the OpenAI client with the given API key
const openai = new OpenAI({ apiKey: apiKeyOpenai });
const unsplash = createApi({ accessKey: apiKeyUnsplash });

export const getWords = action({
    handler: async (ctx) => {
        try {

            /*  Get words from the database */
            let words:any = await ctx.runQuery(api.messages.getWordsOfTheDay);

            /*
                If no words exist in the database:
                1) fetch the api + store words in the db again using internal.openai.sendOpenaiReqs,
                2) fetch the record from the db using api.messages.getWordsOfTheDay)
            */
            if (!words || words.length === 0) {
                console.log("no words")
                await ctx.runAction(internal.openai.sendOpenaiReqs);
                words = await ctx.runQuery(api.messages.getWordsOfTheDay);
            } 

            /*
                If words do exist however and they were stored over 24 hours ago in the db:
                1) delete the record using api.messages.deleteWordsById, 
                2) fetch the api + store words in the db again using internal.openai.sendOpenaiReqs,
                3) fetch the record from the db using api.messages.getWordsOfTheDay)
            */
            else if (words && isOver24Hours(words[0]._creationTime)) {
                console.log("words but over 24 hours")
                const id = words[0]._id;
                await ctx.runMutation(api.messages.deleteWordsById, {id});
                for (const word of words[0].words) {
                    const imageId = word.storageId
                    await ctx.runMutation(api.messages.deleteStorageById, {storageId: imageId});
                }
                await ctx.runAction(internal.openai.sendOpenaiReqs);
                words = await ctx.runQuery(api.messages.getWordsOfTheDay);
            }

            console.log("words existed and returned")
            return words;
        } catch (error) {
            console.error("Error occurred while fetching words:", error);
            throw error; // Rethrow the error to propagate it
        }
    }
})

/* 
    Send openai request to create words and images associates and save data in convex. 
    Also get the word definition and details from dictionary api
*/
export const sendOpenaiReqs = internalAction({
    handler: async (ctx) => {
        const fetchImageUrl = async (imageUrl:string) => {
            try {
                const imageResponse = await fetch(imageUrl);
                if (!imageResponse.ok) {
                    throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
                }
                return imageResponse;
            } catch (error) {
                console.error("Error fetching image:", error);
                throw error;
            }
        };

        try {
            const response = await openai.completions.create({
                model: "gpt-3.5-turbo-instruct",
                prompt: "Can you provide 4 words and return them numbered?"
            });
        
            if (!response || !response.choices || response.choices.length === 0) {
                throw new Error("No response returned from OpenAI");
            }

            const responseSentence = response.choices[0].text;
            const wordsArray = parseOpenAiInputToArray(responseSentence);

            const wordsCollection = await Promise.all(wordsArray.map(async (word) => {

                // const imagePromise = getUnsplashApiImage(word);
                const imagePromise = getDalleImage(word);
                const definitionPromise = getWordDefinition(word);

                const imageUrl = await imagePromise; 
                const wordDetails = await definitionPromise;

                /**
                    The following only if using dall-e. If using unsplash comment the 5 lines 
                    below and replace {image: storageImageUrl} inside return statement with 
                    {image: imageUrl}
                **/
                const imageResponse:any = await fetchImageUrl(imageUrl)
                const arrayBuffer = await imageResponse.arrayBuffer();
                const blob = new Blob([arrayBuffer], { type: imageResponse.headers.get('content-type') });
                const storageId = await ctx.storage.store(blob);
                const storageImageUrl = await ctx.storage.getUrl(storageId);

                return {
                    word,
                    pronounced: false,
                    image: storageImageUrl,
                    storageId,
                    ...wordDetails
                };
            }));
        
            await ctx.runMutation(internal.messages.sendWords, {
                sentence: responseSentence,
                words: wordsCollection,
            });
        } catch (error:any) {
            console.log("Error occurred while processing OpenAI response: " + error.message);
        }
    },
});

const getDalleImage = async (wordString:string) => {
    try {
        let response: any = await openai.images.generate({
            model: "dall-e-2",
            prompt: wordString,
            n: 1
        });
    
        let image_url = await response.data[0].url;
        if (!image_url) {
            throw new Error("Failed to fetch image URL from Dall-e response");
        }
        return image_url;
    } catch (error){
        console.log("getDalleImage error" + error)
        throw error;
    }
}

const getWordDefinition = async (wordString:string) => {
    const url = `https://www.dictionaryapi.com/api/v3/references/sd2/json/${wordString}?key=${apiKeyDictElementary}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network dictionary response returned was not ok');
        }
        const dataArray:any = await response.json();
        const data = dataArray[0]
        const extractedValues = extractValues(data, 't');

        const wordDetailsObject = {
            definition: data.shortdef,
            example:extractedValues,
            type: data.fl  
        }

        return wordDetailsObject
      } catch (error) {
        console.error('There has been a problem with fetch operation in getWordDefinition:', error);
      }
}

const getUnsplashApiImage = async (queryString:string) => {
    try {
        let unsplashResponse:any = await unsplash.search.getPhotos({
            query: queryString,
            page: 1,
            perPage: 10,
            orientation: 'squarish',
        });        

        let image_url = await unsplashResponse.response.results[0].urls.small;
        if (!image_url) {
            throw new Error("Failed to fetch image URL from unsplash response");
        }
        return image_url
    } catch (error) {
        console.log("error:", error)
    }
}
