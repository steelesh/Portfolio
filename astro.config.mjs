import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import sectionize from "@hbsnow/rehype-sectionize";
import playformInline from "@playform/inline";
import { Resvg } from "@resvg/resvg-js";
import {
	transformerMetaHighlight,
	transformerMetaWordHighlight,
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationFocus,
	transformerNotationHighlight,
	transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { rendererRich, transformerTwoslash } from "@shikijs/twoslash";
import pagefind from "astro-pagefind";
import { defineConfig } from "astro/config";
import parseFrontmatter from "gray-matter";
import { h } from "hastscript";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlug from "rehype-slug";
import remarkHint from "remark-hint";
import satori from "satori";
import { remarkReadingTime } from "./src/util/remark-reading-time.mjs";
import {
	transformerCopyButton,
	transformerFileName,
	transformerFileType,
} from "./src/util/transformers";

const renderOg = (title, postUrl) => ({
	type: "div",
	props: {
		style: {
			height: "100%",
			width: "100%",
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: "#f6f8fa",
			backgroundImage: `url("https://steelesh.dev/images/og.png")`,
			fontFamily: "Inter",
			fontSize: 72,
			fontWeight: 600,
		},
		children: [
			{
				type: "svg",
				props: {
					xmlns: "http://www.w3.org/2000/svg",
					viewBox: "0 0 518.6 529.7",
					height: 150,
					width: 150,
					children: [
						{
							type: "path",
							props: {
								fill: "#a52a2a",
								d: "M251.3,527.5c-19.2-2.4-14-5.6,1.9-2,15,.8,25.5,6.9,3.7,2.8l-5.6-.8ZM279.7,528.4c-1.9-5.3,19.4,2,3.3,1.1l-3.3-1.1ZM321.7,523.5c11.1-4.2,24.6-3.9,5.6.6-11.4,3.7-24.8,4.4-5.6-.6h0ZM212,520c-16.3-2.5-20.9-8.2-2.5-3.6,10,.7,37.2,4.6,12.3,5.8l-4.2-.9-5.6-1.3ZM264,517.9c-30.3-4.6-60.5-11.4-91.2-13.3,12.6,4.1,25.9,11.1,4.5,4.9-21-4.8-47.2-17.8-62.9-22.5-7-17.4-40.1-25.5-44.4-43.2-11.2-10.5-27.4-29.8-24.4-32.4-12.7-17.6-22.7-38.8-28.2-57.1-3.4-11.3-13.6-52.4-2.3-20.3,11.2,46.7,35.7,90.9,72.8,122.6,7.8,11.5,40.5,24.7,17.4,8.1-23.4-19-44.4-42.4-57.9-69.4,6-7.2-8.7-4.6-5.9-19.8-4.5-16.1-18.8-43-17.1-52.7-9-8.8,4.2-.4-5.1-15.4-3.8-29.3-7.7-58.2-1-86.8-8.1,20.6.6-12.7-5-9.6.9-21.2,16.4-43.6,27-63.7,7.8-20.6,23.1-38.2,35.1-53.5,16.8-20.9-.9-5.3-3.4-1.8-8.5,9.2-24.7,36-31.1,39.7,0-8.7,30-37.3,11.2-25.6,16.2-20.3,32.7-35.8,54.6-48,7.4-11.3,13.5-22.6,33.8-27.1-11.4,7.2-30.7,16.9-5.7,9.1.7-2.2,25.7-8.8,35.1-19.8,26.8-6.2,53.9-15.4,82.2-14.4,23.4-.5,47.6,3,69.9,8,12.2,8.4,39.2,8.6,43.6,20.8-10.9-7.6-44-12.9-15.2-1.8,13.8,5.4,22,9,13.1,20.7,15.6,1.6-11.6,4.7,6.7,8-17.3,7.7,3.1,10.6-2.9,13.6-17.6,4.8,15.6,8.9-4.3,12.1-15.5,6.6-17.5,25.5-38.4,21.3-29.3-7.9-61-10.5-90.9-4.5-59,19.7-97.5,59.3-117.7,104.1-28.6,63.3-20.5,136.9,18.1,178.7,39.8,43.3,112.7,62.9,171.5,59.6,87.6-8.4,147.2-69.1,171.1-165.5,6.5-15.5,4.3-41,3.4-52.5-6.8-14-9.7-34.9,6-12.7-.8,3.9,14,35.4,7.3,8.8-5.8-18.7-18.2-33.6-22.8-52.1,5.8-2-6.5-18.7,4-3.9,3,4.5,3.4,6.7,7.8,13.6,9.5,14.6,10.3,35.4,18.9,48.4-3.2-24.5-7.6-48.6-22.3-68.9,9.9,9.4,20.8,23.6,24,37.3,6.3,7.8,10.8,32.9,12,22.7,7.7,28.8,0,59.1-5.1,87.7-33.6,67.4-81.7,113.8-9.3,36.4,16.4-21.2-8.4,14.3-6.7,19-5.9,18.9-22.6,30.8-32,46.3-8.5,9-33.7,24.8-35.3,29.4,22.1-.8,39-25.6,56.5-39,5.3-4-16.7,20.8-25.6,26.6-39,26.1-71.1,49.3-114,65-9.4,8.9-42.2,4.9-38,15.5,14,0-5.7,1.6,5.7,4.8-6,5.6-50,5.2-37.1,4.1,11.9,1,43.7-8,15.2-4.2-8.5,1.4-17.9,1-25.6,4.5h0ZM300.1,508.9c-10.3-9.4-23.4,3.2-1.8,1.1l1.5-.3.3-.8h0ZM273.1,504c-10.2-4.2-41.2-5.3-39.2-3.3,12.5.4,28.5,6.3,39.2,3.3ZM175.8,500.8c-20.1-10.1-49.9-22.4-66.9-26.2,18,15.5,44.9,25.2,66.9,26.2ZM128.3,465.5c-8-10.3-27.1-12.8-7.2-3.3,1.9-2.1,5.4,6.3,7.2,3.3ZM105.4,445.2c-11-11.2-21.3-18.6-6-1.9,5.6,6.9,18.7,11.9,6,1.9ZM40,327.3c-1.8,15.3,8.9,42.8,16.7,61.2,6.3,9,21.4,34.7,25.8,31.7l-1.7-2.7c-21.1-27.6-32.6-61.7-40.8-90.2ZM490.3,294.7c2.8-8.2-12,2.5,0,0ZM490.6,282.8c8.7-22.9-4.8-4.8-1.6,4.9l1.2-1.9.5-3ZM491.2,262c3.1-11.1-1.4-42.3-2.1-14.1-1,6.5-3.5,34.3,2.1,14.1ZM113.6,60.4c20.2-13.8,44.2-22.6,64-36.2-30.2,12.4-59.8,27.9-85.2,48.5-4.6,9.1,17.1-11.7,21.2-12.3ZM324.4,508c10.5-4.1,46-18.6,44.2-14.2-11.9,6.1-48.3,18.9-48.5,15.7l4.3-1.5ZM377.8,488.4c15.9-8.2-7.9,6.7,0,0ZM488.6,392.8c11.2-15.3-3.1,9.6,0,0ZM501.6,355.9c15.3-19.3-7.5,14.1,0,0ZM507.8,334.9c4.8-10.4,15.4-24.2,5.2-5.1-1.2-1.6-3.1,8.3-5.2,5.1ZM2.6,288.4c-6.2,0,.5-53.6.7-16.3.2,2.7,1,33.1-.7,16.3ZM2.5,247.3c-3.2-12.4,2.8-46.2,2.9-14.3,0,.2-.1,22.1-2.9,14.3ZM462.2,164.6c-8.7-21.4,18.5,18.7,0,0ZM457,149.2c1.4-9-26.6-35.3-7-17.1,3.1,1.3,21.6,29.6,7,17.1ZM66.1,83.8c5.6-8.6,34-31.8,14-11.6-4.5,4-8.6,8.8-14,11.6ZM143.2,28.6c9.5-6.4,46-21.5,18-7.5-5.4,2.1-13.7,7.6-18,7.5ZM348.4,16.8c-22.4-4.1-37.7-10.3-63.4-12-31.1-.9-63.1-3.2-93.2,6.6-20.9-1.4,23.7-7.6,28.9-8.7,43.8-5.2,89.8-3.4,131,13.2,8.4,4.1.7,4-3.3,1h0Z",
							},
						},
					],
				},
			},
			{
				type: "div",
				props: {
					style: {
						marginTop: 40,
						marginLeft: 40,
						marginRight: 40,
						textAlign: "center",
					},
					children: title,
				},
			},
			{
				type: "div",
				props: {
					style: {
						position: "absolute",
						bottom: 5,
						fontSize: 20,
						fontWeight: 300,
					},
					children: postUrl,
				},
			},
		],
	},
});

const og = () => ({
	name: "satori-og",
	hooks: {
		"astro:build:done": async ({ dir, pages }) => {
			try {
				const inter = fs.readFileSync("public/fonts/Inter-reg.ttf");
				const interBold = fs.readFileSync("public/fonts/Inter-bold.ttf");
				const dirPath = fileURLToPath(dir);

				for (const { pathname } of pages) {
					if (!pathname.startsWith("posts/") && !pathname.startsWith("work/")) {
						const slug = pathname.endsWith("/")
							? pathname.slice(0, -1)
							: pathname.slice();
						const fullUrl = `https://steelesh.dev/${pathname}`;
						const title = slug || "steelesh.dev";

						const svg = await satori(renderOg(title, fullUrl), {
							width: 1200,
							height: 630,
							pixelRatio: 10,
							fonts: [
								{
									name: "Inter",
									data: inter,
									weight: 400,
									style: "normal",
								},
								{
									name: "Inter",
									data: interBold,
									weight: 600,
									style: "normal",
								},
							],
						});
						const resvg = new Resvg(svg, {
							fitTo: {
								mode: "width",
								value: 1200,
							},
						});

						const outputDir = path.join(dirPath, pathname);
						const outputFilename = "og.png";

						fs.mkdirSync(outputDir, { recursive: true });

						const outputPath = path.join(outputDir, outputFilename);

						fs.writeFileSync(outputPath, resvg.render().asPng());
						continue;
					}
					const normalizedPathname = pathname.replace(/^\/+/, "");
					const contentDir = normalizedPathname.startsWith("posts/")
						? "posts"
						: "work";
					const sliceIndex = contentDir.length + 1;
					let articleName = normalizedPathname.slice(sliceIndex);

					if (articleName.endsWith("/")) {
						articleName = articleName.slice(0, -1);
					}
					const filePath = path.join(
						"src",
						"content",
						contentDir,
						`${articleName}.md`,
					);

					if (!fs.existsSync(filePath)) {
						continue;
					}

					const file = fs.readFileSync(filePath);
					const { title } = parseFrontmatter(file).data;
					const fullUrl = `https://steelesh.dev/${pathname}`;

					const svg = await satori(renderOg(title, fullUrl), {
						width: 1200,
						height: 630,
						pixelRatio: 10,
						fonts: [
							{
								name: "Inter",
								data: inter,
								weight: 400,
								style: "normal",
							},
							{
								name: "Inter",
								data: interBold,
								weight: 600,
								style: "normal",
							},
						],
					});

					const resvg = new Resvg(svg, {
						fitTo: {
							mode: "width",
							value: 1200,
						},
					});

					const outputDir = path.join(dirPath, normalizedPathname);
					const outputFilename = "og.png";

					fs.mkdirSync(outputDir, { recursive: true });

					const outputPath = path.join(outputDir, outputFilename);

					fs.writeFileSync(outputPath, resvg.render().asPng());
				}
				console.log("\x1b[32mog:\x1b[0m Generated OpenGraph images\n");
			} catch (e) {
				console.error(e);
				console.log("\x1b[31mog:\x1b[0m OpenGraph image generation failed\n");
			}
		},
	},
});

export default defineConfig({
	site: "https://steelesh.dev",
	trailingSlash: "never",
	integrations: [react(), pagefind(), playformInline(), og()],

	markdown: {
		syntaxHighlight: "shiki",
		shikiConfig: {
			theme: "vitesse-dark",
			wrap: true,
			transformers: [
				transformerTwoslash({
					explicitTrigger: true,
					renderer: rendererRich(),
				}),
				transformerNotationDiff(),
				transformerNotationHighlight(),
				transformerNotationWordHighlight(),
				transformerNotationFocus(),
				transformerMetaHighlight(),
				transformerMetaWordHighlight(),
				transformerNotationErrorLevel(),
				transformerFileName(),
				transformerFileType(),
				transformerCopyButton(),
			],
		},
		remarkPlugins: [remarkHint, remarkReadingTime],
		rehypePlugins: [
			sectionize,
			rehypeSlug,
			[
				rehypeExternalLinks,
				{
					target: "_blank",
					rel: ["nofollow", "noopener", "noreferrer"],
				},
			],
			[
				rehypeAutolinkHeadings,
				{
					behavior: "wrap",
					content: [
						h(
							"span.anchor-icon",
							{
								ariaHidden: "true",
							},
							h(
								"svg",
								{
									width: 13,
									height: 13,
									version: 1.1,
									viewBox: "0 0 16 16",
									xlmns: "http://www.w3.org/2000/svg",
								},
								h("path", {
									fillRule: "evenodd",
									fill: "currentcolor",
									d: "M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z",
								}),
							),
						),
					],
					properties: {
						className: "heading-group",
					},
				},
			],
		],
	},
});
