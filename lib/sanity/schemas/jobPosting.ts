import { defineField, defineType } from "sanity";

export const jobPostingSchema = defineType({
  name: "jobPosting",
  title: "Job Postings",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Job Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "department",
      title: "Department",
      type: "string",
      options: {
        list: [
          { title: "Data Engineering", value: "Data Engineering" },
          { title: "Analytics & BI", value: "Analytics & BI" },
          { title: "Financial Performance", value: "Financial Performance" },
          { title: "AI & Data Science", value: "AI & Data Science" },
          { title: "Cloud & Platform", value: "Cloud & Platform" },
          { title: "Software Engineering (R&D)", value: "Software Engineering (R&D)" },
          { title: "Other", value: "Other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "e.g. Istanbul, Turkey / Remote / USA",
    }),
    defineField({
      name: "type",
      title: "Employment Type",
      type: "string",
      options: {
        list: [
          { title: "Full-time", value: "Full-time" },
          { title: "Part-time", value: "Part-time" },
          { title: "Contract", value: "Contract" },
          { title: "Remote", value: "Remote" },
        ],
      },
    }),
    defineField({
      name: "description",
      title: "Job Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "requirements",
      title: "Requirements",
      type: "array",
      of: [{ type: "string" }],
      description: "List of requirements/qualifications",
    }),
    defineField({
      name: "isActive",
      title: "Active Posting",
      type: "boolean",
      description: "Uncheck to hide this position from the site",
      initialValue: true,
    }),
    defineField({
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "department",
      active: "isActive",
    },
    prepare({ title, subtitle, active }) {
      return {
        title: `${active ? "✓" : "✗"} ${title}`,
        subtitle,
      };
    },
  },
});
