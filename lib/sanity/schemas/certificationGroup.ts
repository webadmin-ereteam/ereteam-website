import { defineField, defineType } from "sanity";

export const certificationGroupSchema = defineType({
  name: "certificationGroup",
  title: "Certifications",
  type: "document",
  fields: [
    defineField({
      name: "vendor",
      title: "Vendor Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "certifications",
      title: "Certifications",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "name", title: "Certification Name", type: "string" }),
          ],
          preview: {
            select: { title: "name" },
          },
        },
      ],
    }),
    defineField({
      name: "colorTheme",
      title: "Color Theme",
      type: "string",
      description: "Background color used on the certifications page",
      options: {
        list: [
          { title: "🔵 Blue (IBM)", value: "blue" },
          { title: "🟠 Orange (AWS)", value: "orange" },
          { title: "🔴 Red (HCL)", value: "red" },
          { title: "🩵 Sky (Alteryx)", value: "sky" },
          { title: "🩵 Cyan (Tableau)", value: "cyan" },
          { title: "🟣 Violet (DataRobot)", value: "violet" },
          { title: "🟢 Green", value: "green" },
          { title: "🌸 Pink", value: "pink" },
          { title: "🟡 Yellow", value: "yellow" },
          { title: "⚫ Gray (default)", value: "gray" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first",
    }),
  ],
  preview: {
    select: { title: "vendor" },
  },
});
