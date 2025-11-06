import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    heroImage: z.string().optional(),
    isDraft: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};
