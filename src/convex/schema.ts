import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    wordsOfTheDay: defineTable({
        sentence: v.string(),
        words: v.array(v.object({
            word: v.string(),
            pronounced: v.boolean(),
            image: v.any(),
            storageId: v.optional(v.any()),
            definition: v.optional(v.array(v.string())),
            type: v.optional(v.string()),
            example: v.optional(v.array(v.string())),
        }))
    }),
    messages: defineTable({
        image: v.optional(v.string()),
        format: v.optional(v.string()),
        body: v.optional(v.string())
    }),
    wordGame: defineTable({
        words: v.array(v.object({
          word: v.string(),
          image: v.string(),
          guessed: v.boolean() 
        }))
    })
})
