import { defineField, defineType } from "sanity";

export const partnerSchema = defineType({
  name: "partner",
  title: "Partners",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Partner Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "areas",
      title: "Expertise Areas",
      type: "array",
      of: [{ type: "string" }],
      description: "e.g. Cloud Migration, Data Lake, AI Deployment",
    }),
    defineField({
      name: "useCases",
      title: "Use Cases",
      type: "array",
      of: [{ type: "string" }],
      description: "Reference projects with this partner",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first",
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "logo",
    },
  },
});
