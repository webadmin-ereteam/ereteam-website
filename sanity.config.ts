import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemas } from "./lib/sanity/schemas";

export default defineConfig({
  name: "ereteam",
  title: "Ereteam CMS",
  projectId: "oe7hnrwl",
  dataset: "production",
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content Management")
          .items([
            S.listItem()
              .title("Blog Posts")
              .child(S.documentTypeList("blog").title("Blog Posts")),
            S.listItem()
              .title("News")
              .child(S.documentTypeList("news").title("News")),
            S.divider(),
            S.listItem()
              .title("Success Stories")
              .child(S.documentTypeList("successStory").title("Success Stories")),
            S.listItem()
              .title("Team Members")
              .child(S.documentTypeList("teamMember").title("Team Members")),
            S.listItem()
              .title("Job Postings")
              .child(S.documentTypeList("jobPosting").title("Job Postings")),
            S.divider(),
            S.listItem()
              .title("Partners")
              .child(S.documentTypeList("partner").title("Partners")),
            S.listItem()
              .title("Certifications")
              .child(S.documentTypeList("certificationGroup").title("Certifications")),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemas,
  },
});
