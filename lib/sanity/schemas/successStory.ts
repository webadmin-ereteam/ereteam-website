import { defineField, defineType } from "sanity";

export const successStorySchema = defineType({
  name: "successStory",
  title: "Success Stories",
  type: "document",
  fields: [
    defineField({
      name: "industry",
      title: "Industry",
      type: "string",
      options: {
        list: [
          { title: "Banking & Finance", value: "Banking & Finance" },
          { title: "Insurance", value: "Insurance" },
          { title: "Telecom", value: "Telecom" },
          { title: "Pharma & Biotech", value: "Pharma & Biotech" },
          { title: "Retail", value: "Retail" },
          { title: "Manufacturing", value: "Manufacturing" },
          { title: "Media", value: "Media" },
          { title: "Other", value: "Other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "project",
      title: "Project Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "technologies",
      title: "Technologies",
      type: "array",
      of: [{ type: "string" }],
      description: "e.g. IBM Planning Analytics, AWS, Python",
    }),
    defineField({
      name: "summary",
      title: "Project Summary",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "results",
      title: "Results",
      type: "text",
      rows: 3,
      description: "Key outcomes and measurable results",
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
      title: "project",
      subtitle: "industry",
    },
    prepare({ title, subtitle }) {
      return { title, subtitle };
    },
  },
});
