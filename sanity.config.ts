import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemas } from "./lib/sanity/schemas";

export default defineConfig({
  name: "ereteam",
  title: "Ereteam CMS",
  // Driven by the same env var the website's runtime client reads, so Studio
  // and the site can never point at different Sanity projects.
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "oe7hnrwl",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content Management")
          .items([
            S.listItem()
              .title("Success Stories")
              .child(S.documentTypeList("successStory").title("Success Stories")),
            S.listItem()
              .title("Partners Board")
              .child(S.documentTypeList("teamMember").title("Partners Board")),
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
