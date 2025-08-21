import matter from 'gray-matter';
import yaml from 'js-yaml';

/**
 * Remove any falsy or undefined values from nested object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sanitize = (obj: any): any => {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value === null ? undefined : value;
    })
  );
};

export const mergeFrontmatter = (
  textWithFrontMatter: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newFrontMatter: Record<string, any>
): string => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const cleanFrontmatter = sanitize(newFrontMatter);
  const { data, content } = matter(textWithFrontMatter);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mergedFrontMatter = Object.assign({}, data, cleanFrontmatter);
  const yamlContent = yaml.dump(mergedFrontMatter, { flowLevel: -1, lineWidth: -1 });
  const trimmedContent = content.startsWith('\n') ? content.slice(1) : content;
  return `---\n${yamlContent}---\n\n${trimmedContent}`;
};
