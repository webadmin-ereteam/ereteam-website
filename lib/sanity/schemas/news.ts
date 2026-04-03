import { defineField, defineType } from "sanity";

export const newsSchema = defineType({
  name: "news",
  title: "Haberler",
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
      name: "category",
      title: "Kategori",
      type: "string",
      options: {
        list: [
          { title: "Şirket Haberleri", value: "company" },
          { title: "Sektör Haberleri", value: "industry" },
          { title: "Ürün Güncellemeleri", value: "product" },
          { title: "Etkinlikler", value: "events" },
        ],
      },
    }),
    defineField({
      name: "source",
      title: "Kaynak",
      type: "string",
      description: "Haberin kaynağı (opsiyonel)",
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
      category: "category",
      media: "mainImage",
    },
    prepare({ title, category, media }) {
      const categoryLabels: Record<string, string> = {
        company: "Şirket",
        industry: "Sektör",
        product: "Ürün",
        events: "Etkinlik",
      };
      return {
        title,
        subtitle: category ? categoryLabels[category] : "",
        media,
      };
    },
  },
});
