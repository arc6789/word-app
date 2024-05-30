import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getWordsOfTheDay = query(async (ctx) => {
    return await ctx.db.query("wordsOfTheDay").collect();;
});

export const getWordGameData = query(async (ctx) => {
    const hello = await ctx.db.query("wordGame").collect();
    return hello
});

export const sendWords = internalMutation({
    args: {
        sentence: v.string(),
        words: v.array(v.object({
            word: v.string(),
            pronounced: v.boolean(),
            storageId: v.optional(v.any()),
            image: v.any(),
            definition: v.optional(v.array(v.string())),
            type: v.optional(v.string()),
            example: v.optional(v.array(v.string())),
        }))
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("wordsOfTheDay", {
            sentence: args.sentence,
            words: args.words,
        });
    },
});

export const sendWordGameData = mutation({
    args: {
        words: v.array(v.object({
          word: v.string(),
          image: v.string(),
          guessed: v.boolean()}
        ))
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("wordGame", {
            words: args.words
        });
    },
});

export const deleteWordsById = mutation({
    args: {
        id: v.id("wordsOfTheDay"),
    },
    handler: async (ctx, args) => {
      return await ctx.db.delete(args.id);
    },
});

export const deleteStorageById = mutation({
    args: {
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        return await ctx.storage.delete(args.storageId);
    },
});
