import slugify from "slugify";
import type { Repository, ObjectLiteral } from "typeorm";

/**
 * Generates a unique slug for an entity by checking the database.
 * If the slug already exists, appends a number suffix.
 */
export async function generateUniqueSlug<T extends ObjectLiteral>(
  value: string,
  repo: Repository<T>,
  slugField: keyof T & string = "slug" as keyof T & string
): Promise<string> {
  const baseSlug = slugify(value, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (await repo.findOne({ where: { [slugField]: slug } as any })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
