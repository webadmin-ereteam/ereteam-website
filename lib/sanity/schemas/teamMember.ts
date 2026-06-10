import { defineField, defineType } from "sanity";

export const teamMemberSchema = defineType({
  name: "teamMember",
  title: "Team Members",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Job Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "region",
      title: "Region",
      type: "string",
      options: {
        list: [
          { title: "US", value: "US" },
          { title: "TR", value: "TR" },
        ],
      },
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Photo (Leadership / Default)",
      type: "image",
      options: { hotspot: true },
      description: "Default photo used for Leadership Team (4:3 ratio).",
    }),
    defineField({
      name: "imagePartners",
      title: "Photo (Partners Board)",
      type: "image",
      options: { hotspot: true },
      description: "Optional. Use this if you need a different crop or photo for the Partners Board (1:1 square ratio). If left empty, the default photo is used.",
    }),
    defineField({
      name: "linkedIn",
      title: "LinkedIn URL",
      type: "url",
    }),
    defineField({
      name: "groups",
      title: "Groups",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Leadership Team", value: "leadership" },
          { title: "Partners Board", value: "partners_board" },
        ],
        layout: "tags",
      },
      description: "Assign to one or both groups",
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
      subtitle: "title",
      media: "image",
    },
  },
});
