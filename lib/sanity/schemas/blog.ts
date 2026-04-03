import { defineField, defineType } from "sanity";

export const blogSchema = defineType({
  name: "blog",
  title: "Blog",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Başlık",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL (Slug)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Yayın Tarihi",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Kısa Özet",
      type: "text",
      rows: 3,
      description: "Liste sayfasında gösterilecek kısa açıklama",
    }),
    defineField({
      name: "mainImage",
      title: "Kapak Görseli",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description: "YouTube veya Vimeo video linki (opsiyonel)",
    }),
    defineField({
      name: "author",
      title: "Yazar",
      type: "string",
    }),
    defineField({
      name: "body",
      title: "İçerik",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Başlık 1", value: "h1" },
            { title: "Başlık 2", value: "h2" },
            { title: "Başlık 3", value: "h3" },
            { title: "Alıntı", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Kalın", value: "strong" },
              { title: "İtalik", value: "em" },
              { title: "Altı Çizili", value: "underline" },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author",
      media: "mainImage",
    },
    prepare({ title, author, media }) {
      return {
        title,
        subtitle: author ? `${author}` : "",
        media,
      };
    },
  },
});
